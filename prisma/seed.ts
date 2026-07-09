import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { GOPAGE_CATEGORIES } from "../scripts/lib/gopage-parser";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Pedrin127_", 12);

  await prisma.user.upsert({
    where: { email: "pedrin127silva@gmail.com" },
    update: { role: "ADMIN", passwordHash, name: "Pedrin Admin" },
    create: {
      name: "Pedrin Admin",
      email: "pedrin127silva@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const cat of GOPAGE_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  console.log(`Seed OK: admin + ${GOPAGE_CATEGORIES.length} categorias`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
