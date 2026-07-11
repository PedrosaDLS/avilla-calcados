import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  material: z.string().optional().default(""),
  price: z.number().positive(),
  promoPrice: z.number().positive().nullable().optional(),
  isLaunch: z.boolean().optional().default(false),
  categoryId: z.string().min(1),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        sortOrder: z.number().int().default(0),
      })
    )
    .default([]),
});

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = productSchema.parse(await req.json());
  let slug = slugify(body.name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description,
      material: body.material,
      price: body.price,
      promoPrice: body.promoPrice ?? null,
      isLaunch: body.isLaunch,
      categoryId: body.categoryId,
    },
  });

  if (body.images.length) {
    await prisma.productImage.createMany({
      data: body.images.map((img, i) => ({
        productId: product.id,
        url: img.url,
        sortOrder: img.sortOrder ?? i,
        colorId: null,
      })),
    });
  }

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, category: true },
  });

  return NextResponse.json(full, { status: 201 });
}
