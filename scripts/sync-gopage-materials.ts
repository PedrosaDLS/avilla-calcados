import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { fetchAllGopageProducts, extractGopageMaterial } from "./lib/gopage-parser";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const { products: gopageProducts } = await fetchAllGopageProducts();
  const materialBySlug = new Map<string, string>();

  for (const product of gopageProducts) {
    const material = extractGopageMaterial(product.description);
    if (material) materialBySlug.set(product.slug, material);
  }

  const dbProducts = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, material: true },
  });

  let updated = 0;
  let missing = 0;
  let unchanged = 0;

  for (const product of dbProducts) {
    const material = materialBySlug.get(product.slug);
    if (!material) {
      missing++;
      console.warn(`Sem material Gopage: ${product.slug}`);
      continue;
    }

    if (product.material === material) {
      unchanged++;
      continue;
    }

    console.log(`${product.slug}: "${product.material}" -> "${material}"`);
    if (!dryRun) {
      await prisma.product.update({
        where: { id: product.id },
        data: { material },
      });
    }
    updated++;
  }

  console.log("\nResumo:");
  console.log(`- Gopage com material: ${materialBySlug.size}`);
  console.log(`- DB produtos: ${dbProducts.length}`);
  console.log(`- Atualizados: ${updated}`);
  console.log(`- Inalterados: ${unchanged}`);
  console.log(`- Sem match Gopage: ${missing}`);
  console.log(`- dryRun: ${dryRun}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
