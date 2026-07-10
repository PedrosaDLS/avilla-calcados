import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().nullable().optional(),
  sizes: z.array(z.string().min(1)).default([]),
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  price: z.number().positive(),
  promoPrice: z.number().positive().nullable().optional(),
  isLaunch: z.boolean().optional().default(false),
  categoryId: z.string().min(1),
  colors: z.array(colorSchema).default([]),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        sortOrder: z.number().int().default(0),
        colorName: z.string().nullable().optional(),
      })
    )
    .default([]),
});

async function createSizesForColors(
  productId: string,
  colors: { id: string; name: string }[],
  colorPayload: z.infer<typeof colorSchema>[]
) {
  const rows: { productId: string; colorId: string; size: string }[] = [];
  for (const color of colors) {
    const payload = colorPayload.find(
      (c) => c.name.toLowerCase() === color.name.toLowerCase()
    );
    for (const size of payload?.sizes ?? []) {
      rows.push({ productId, colorId: color.id, size });
    }
  }
  if (rows.length) {
    await prisma.productSize.createMany({ data: rows });
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      colors: true,
      sizes: true,
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
      price: body.price,
      promoPrice: body.promoPrice ?? null,
      isLaunch: body.isLaunch,
      categoryId: body.categoryId,
      colors: {
        create: body.colors.map((c) => ({ name: c.name, hex: c.hex ?? null })),
      },
    },
    include: { colors: true },
  });

  await createSizesForColors(product.id, product.colors, body.colors);

  if (body.images.length) {
    await prisma.productImage.createMany({
      data: body.images.map((img, i) => {
        const color = img.colorName
          ? product.colors.find(
              (c) => c.name.toLowerCase() === img.colorName!.toLowerCase()
            )
          : null;
        return {
          productId: product.id,
          url: img.url,
          sortOrder: img.sortOrder ?? i,
          colorId: color?.id ?? null,
        };
      }),
    });
  }

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: { colors: true, sizes: true, images: true, category: true },
  });

  return NextResponse.json(full, { status: 201 });
}
