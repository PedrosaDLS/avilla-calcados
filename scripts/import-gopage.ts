import "dotenv/config";
import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import { constants } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
  fetchAllGopageProducts,
  extractGopageMaterial,
  GOPAGE_CATEGORIES,
  type GopageProduct,
} from "./lib/gopage-parser";
import { cleanProductName } from "./lib/product-name";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type ImportOptions = {
  dryRun: boolean;
  replace: boolean;
  skipImages: boolean;
  page?: number;
};

type ImportReport = {
  startedAt: string;
  finishedAt?: string;
  dryRun: boolean;
  totalFetched: number;
  imported: number;
  skipped: number;
  errors: { slug: string; message: string }[];
  missingDescription: string[];
  failedImages: { slug: string; url: string; message: string }[];
  externalImageUrls: string[];
  unmappedVariations: { slug: string; detail: string }[];
  duplicateSlugs: { name: string; slug: string }[];
};

function parseArgs(argv: string[]): ImportOptions {
  const options: ImportOptions = {
    dryRun: argv.includes("--dry-run"),
    replace: !argv.includes("--no-replace"),
    skipImages: argv.includes("--skip-images"),
  };

  const pageArg = argv.find((arg) => arg.startsWith("--page="));
  if (pageArg) {
    const page = Number(pageArg.split("=")[1]);
    if (!Number.isFinite(page) || page < 1) {
      throw new Error("Valor inválido para --page");
    }
    options.page = page;
  }

  return options;
}

function getUploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

function imageFilename(imageUrl: string, order: number) {
  const base = path.basename(new URL(imageUrl).pathname);
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${order}-${safeBase}`;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(url: string, destPath: string, retries = 3) {
  if (await fileExists(destPath)) return;

  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "AvillaImport/1.0" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await mkdir(path.dirname(destPath), { recursive: true });
      await writeFile(destPath, buffer);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }

  throw lastError;
}

async function upsertCategories(dryRun: boolean) {
  if (dryRun) return;

  for (const category of GOPAGE_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
}

async function importProduct(
  product: GopageProduct,
  options: ImportOptions,
  report: ImportReport
) {
  const categorySlug = product.categories[0]?.slug;
  if (!categorySlug) {
    report.errors.push({ slug: product.slug, message: "Produto sem categoria" });
    report.skipped++;
    return;
  }

  if (product.has_variations) {
    report.unmappedVariations.push({
      slug: product.slug,
      detail: JSON.stringify(product.variations ?? null),
    });
  }

  if (!product.description?.trim()) {
    report.missingDescription.push(product.slug);
  }

  if (options.dryRun) {
    if (!GOPAGE_CATEGORIES.some((c) => c.slug === categorySlug)) {
      report.errors.push({
        slug: product.slug,
        message: `Categoria desconhecida: ${categorySlug}`,
      });
      report.skipped++;
      return;
    }
    report.imported++;
    return;
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    report.errors.push({
      slug: product.slug,
      message: `Categoria não encontrada: ${categorySlug}`,
    });
    report.skipped++;
    return;
  }

  const slug = product.slug;

  const uploadRoot = getUploadRoot();
  const imageRecords: { url: string; sortOrder: number }[] = [];

  if (!options.skipImages) {
    const sortedImages = [...product.images].sort((a, b) => a.order - b.order);
    for (const image of sortedImages) {
      const filename = imageFilename(image.url, image.order);
      const relativePath = path.posix.join("gopage", slug, filename);
      const diskPath = path.join(uploadRoot, relativePath);
      const publicUrl = `/uploads/${relativePath.replace(/\\/g, "/")}`;

      try {
        await downloadImage(image.url, diskPath);
        imageRecords.push({ url: publicUrl, sortOrder: image.order });
      } catch (error) {
        report.failedImages.push({
          slug: product.slug,
          url: image.url,
          message: error instanceof Error ? error.message : String(error),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  const data = {
    name: cleanProductName(product.name),
    description: product.description ?? "",
    material: extractGopageMaterial(product.description),
    price: product.price,
    promoPrice: product.sale_price,
    isLaunch: product.highlight,
    categoryId: category.id,
  };

  const saved = existing
    ? await prisma.product.update({ where: { slug }, data })
    : await prisma.product.create({ data: { ...data, slug } });

  await prisma.productColor.deleteMany({ where: { productId: saved.id } });
  await prisma.productSize.deleteMany({ where: { productId: saved.id } });
  await prisma.productImage.deleteMany({ where: { productId: saved.id } });

  if (imageRecords.length) {
    await prisma.productImage.createMany({
      data: imageRecords.map((img) => ({
        productId: saved.id,
        url: img.url,
        sortOrder: img.sortOrder,
      })),
    });
  }

  const external = imageRecords.filter((img) => img.url.startsWith("http"));
  report.externalImageUrls.push(...external.map((img) => img.url));

  report.imported++;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report: ImportReport = {
    startedAt: new Date().toISOString(),
    dryRun: options.dryRun,
    totalFetched: 0,
    imported: 0,
    skipped: 0,
    errors: [],
    missingDescription: [],
    failedImages: [],
    externalImageUrls: [],
    unmappedVariations: [],
    duplicateSlugs: [],
  };

  console.log(
    `Importação Gopage — dryRun=${options.dryRun} replace=${options.replace} skipImages=${options.skipImages}${
      options.page ? ` page=${options.page}` : ""
    }`
  );

  if (!options.dryRun && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada");
  }

  if (!options.skipImages && !options.dryRun) {
    const uploadRoot = getUploadRoot();
    await mkdir(path.join(uploadRoot, "gopage"), { recursive: true });
  }

  if (options.replace && !options.dryRun) {
    const deleted = await prisma.product.deleteMany();
    console.log(`Produtos existentes removidos: ${deleted.count}`);
  }

  await upsertCategories(options.dryRun);

  const { products } = await fetchAllGopageProducts(options.page);
  report.totalFetched = products.length;
  console.log(`Produtos encontrados no Gopage: ${products.length}`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i + 1}/${products.length}] ${product.name}`);
    await importProduct(product, options, report);
  }

  report.finishedAt = new Date().toISOString();

  const reportPath = path.join(process.cwd(), "scripts", "import-gopage-report.json");
  if (!options.dryRun) {
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  }

  console.log("\nResumo:");
  console.log(`- Importados: ${report.imported}`);
  console.log(`- Ignorados: ${report.skipped}`);
  console.log(`- Erros: ${report.errors.length}`);
  console.log(`- Imagens com falha: ${report.failedImages.length}`);
  console.log(`- Sem descrição: ${report.missingDescription.length}`);
  if (!options.dryRun) {
    console.log(`- Relatório: ${reportPath}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
