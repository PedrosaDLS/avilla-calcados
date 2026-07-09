import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const [products, categories, images, external] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.productImage.count({ where: { url: { startsWith: "http" } } }),
  ]);

  const sample = await prisma.product.findFirst({
    where: { slug: "tamanco-salto-fino-esfera-r22000" },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });

  console.log(
    JSON.stringify(
      {
        products,
        categories,
        images,
        externalImageUrls: external,
        sample: sample
          ? {
              name: sample.name,
              description: sample.description,
              price: sample.price.toString(),
              category: sample.category.name,
              imageCount: sample.images.length,
              firstImage: sample.images[0]?.url,
            }
          : null,
      },
      null,
      2
    )
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
