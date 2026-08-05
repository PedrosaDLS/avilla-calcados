import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { generateProductDescription } from "../src/lib/mistral-describe";
import { isGopageCatalogDescription } from "./lib/gopage-parser";
import {
  auditDescription,
  formatAuditRow,
  type AuditRow,
} from "../src/lib/description-audit";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });
if (process.env.DOTENV_CONFIG_PATH) {
  loadEnv({ path: process.env.DOTENV_CONFIG_PATH, override: true });
}

type Mode = "regenerate" | "audit" | "fix-agreement";

type Options = {
  mode: Mode;
  dryRun: boolean;
  slug?: string;
  force: boolean;
  delayMs: number;
};

function parseArgs(argv: string[]): Options {
  let mode: Mode = "regenerate";
  if (argv.includes("--audit")) mode = "audit";
  else if (argv.includes("--fix-agreement")) mode = "fix-agreement";

  const options: Options = {
    mode,
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

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: { url: string }[];
};

function collectFlagged(products: ProductRow[]): AuditRow[] {
  const flagged: AuditRow[] = [];
  for (const product of products) {
    const findings = auditDescription(product.name, product.description);
    if (findings.length) {
      flagged.push(formatAuditRow(product, findings));
    }
  }
  return flagged;
}

function writeAuditReport(flagged: AuditRow[], total: number) {
  const outPath = join(process.cwd(), "scripts/out/description-audit.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalProducts: total,
        flaggedCount: flagged.length,
        flagged,
      },
      null,
      2
    ),
    "utf8"
  );
  return outPath;
}

function printAuditSummary(flagged: AuditRow[], total: number, outPath: string) {
  console.log(`\nAuditoria — produtos=${total} flagged=${flagged.length}`);
  console.log(`Relatório: ${outPath}`);

  const byReason = new Map<string, number>();
  for (const row of flagged) {
    for (const reason of row.reasons) {
      byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
    }
  }
  if (byReason.size) {
    console.log("Motivos:");
    for (const [reason, count] of [...byReason.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${count}× ${reason}`);
    }
  }

  console.log("\nAmostra (até 15):");
  for (const row of flagged.slice(0, 15)) {
    console.log(`- ${row.slug}`);
    console.log(`  nome: ${row.name}`);
    console.log(`  trecho: ${row.snippet}`);
    console.log(`  motivo: ${row.reasons.join("; ")}`);
  }
}

async function createPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  return { pool, prisma };
}

async function loadProducts(
  prisma: PrismaClient,
  slug?: string
): Promise<ProductRow[]> {
  return prisma.product.findMany({
    where: slug ? { slug } : undefined,
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
}

async function regenerateProducts(
  products: ProductRow[],
  options: Options,
  apiKey: string,
  prisma: PrismaClient,
  label: string
) {
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { slug: string; message: string }[] = [];

  console.log(
    `${label} — produtos=${products.length} dryRun=${options.dryRun} force=${options.force}`
  );

  for (let i = 0; i < products.length; i++) {
    const product = products[i]!;
    const imageUrl = product.images[0]?.url;

    if (!imageUrl) {
      skipped++;
      console.warn(`[${i + 1}/${products.length}] ${product.slug}: sem imagem`);
      continue;
    }

    if (
      options.mode === "regenerate" &&
      !options.force &&
      product.description.trim() &&
      !isGopageCatalogDescription(product.description)
    ) {
      skipped++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${products.length}] ${product.slug}`);
      const description = await generateProductDescription(imageUrl, apiKey, {
        name: product.name,
      });

      if (options.dryRun) {
        console.log(`  -> ${description}`);
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: { description },
        });
        product.description = description;
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

  return { updated, skipped, failed };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { pool, prisma } = await createPrisma();

  try {
    const products = await loadProducts(prisma, options.slug);

    if (options.mode === "audit") {
      const flagged = collectFlagged(products);
      const outPath = writeAuditReport(flagged, products.length);
      printAuditSummary(flagged, products.length, outPath);
      return;
    }

    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY não configurada.");
    }

    if (options.mode === "fix-agreement") {
      const flagged = collectFlagged(products);
      const outPath = writeAuditReport(flagged, products.length);
      printAuditSummary(flagged, products.length, outPath);

      if (!flagged.length) {
        console.log("\nNenhum produto flagged — nada a regenerar.");
        return;
      }

      const byId = new Map(products.map((p) => [p.id, p]));
      const toFix = flagged
        .map((row) => byId.get(row.id))
        .filter((p): p is ProductRow => Boolean(p));

      const result = await regenerateProducts(
        toFix,
        { ...options, force: true },
        apiKey,
        prisma,
        "Corrigir concordância"
      );

      if (result.failed > 0) {
        process.exitCode = 1;
      }

      // Re-audit remaining among the ones we tried to fix (using in-memory
      // descriptions after updates; re-fetch for accuracy if not dry-run).
      const refreshed =
        options.dryRun
          ? toFix
          : await loadProducts(
              prisma,
              options.slug
            ).then((all) => {
              const ids = new Set(toFix.map((p) => p.id));
              return all.filter((p) => ids.has(p.id));
            });
      const stillBad = collectFlagged(refreshed);
      console.log(
        `\nRe-auditoria dos regenerados: ainda flagged=${stillBad.length}/${refreshed.length}`
      );
      if (stillBad.length) {
        for (const row of stillBad.slice(0, 10)) {
          console.log(`- ${row.slug}: ${row.reasons.join("; ")} | ${row.snippet}`);
        }
      }
      return;
    }

    const result = await regenerateProducts(
      products,
      options,
      apiKey,
      prisma,
      "Regenerar descrições"
    );
    if (result.failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
