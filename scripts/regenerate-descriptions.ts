import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { generateProductDescription } from "../src/lib/mistral-describe";
import { isGopageCatalogDescription } from "./lib/gopage-parser";

loadEnv({ path: ".env" });
if (process.env.DOTENV_CONFIG_PATH) {
  loadEnv({ path: process.env.DOTENV_CONFIG_PATH, override: true });
}

type Options = {
  dryRun: boolean;
  slug?: string;
  force: boolean;
  delayMs: number;
};

function parseArgs(argv: string[]): Options {
  const options: Options = {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    delayMs: 400,
  };

  const slugArg = argv.find((arg) => arg.startsWith("--slug="));
  if (slugArg) {
    options.slug = slugArg.split("=")[1];
  }

  const delayArg = argv.find((arg) => arg.startsWith("--delay="));
  if (delayArg) {
    const delay = Number(delayArg.split("=")[1]);
    if (Number.isFinite(delay) && delay >= 0) {
      options.delayMs = delay;
    }
  }

  return options;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = process.env.MISTRAL_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY não configurada.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const products = await prisma.product.findMany({
    where: options.slug ? { slug: options.slug } : undefined,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { slug: string; message: string }[] = [];

  console.log(
    `Regenerar descrições — produtos=${products.length} dryRun=${options.dryRun} force=${options.force}`
  );

  for (let i = 0; i < products.length; i++) {
    const product = products[i]!;
    const imageUrl = product.images[0]?.url;

    if (!imageUrl) {
      skipped++;
      console.warn(`[${i + 1}/${products.length}] ${product.slug}: sem imagem`);
      continue;
    }

    if (!options.force && product.description.trim() && !isGopageCatalogDescription(product.description)) {
      skipped++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${products.length}] ${product.slug}`);
      const description = await generateProductDescription(imageUrl, apiKey);

      if (options.dryRun) {
        console.log(`  -> ${description}`);
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: { description },
        });
      }

      updated++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ slug: product.slug, message });
      console.error(`  ERRO: ${message}`);
    }

    if (options.delayMs > 0 && i < products.length - 1) {
      await sleep(options.delayMs);
    }
  }

  console.log("\nResumo:");
  console.log(`- Atualizados: ${updated}`);
  console.log(`- Ignorados: ${skipped}`);
  console.log(`- Falhas: ${failed}`);
  if (errors.length) {
    console.log("- Erros:");
    for (const err of errors.slice(0, 10)) {
      console.log(`  ${err.slug}: ${err.message}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
