import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { cleanProductName } from "./lib/product-name";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  const samples: { before: string; after: string }[] = [];

  for (const product of products) {
    const cleaned = cleanProductName(product.name);
    if (cleaned === product.name) continue;

    await prisma.product.update({
      where: { id: product.id },
      data: { name: cleaned },
    });

    if (samples.length < 5) {
      samples.push({ before: product.name, after: cleaned });
    }
    updated++;
  }

  console.log(`Modelos atualizados: ${updated}/${products.length}`);
  if (samples.length) {
    console.log("\nExemplos:");
    for (const s of samples) {
      console.log(`- "${s.before}" → "${s.after}"`);
    }
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
