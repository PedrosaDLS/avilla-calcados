import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().nullable().optional(),
  sizes: z.array(z.string().min(1)).default([]),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  promoPrice: z.number().positive().nullable().optional(),
  isLaunch: z.boolean().optional(),
  categoryId: z.string().optional(),
  colors: z.array(colorSchema).optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        sortOrder: z.number().int().default(0),
        colorName: z.string().nullable().optional(),
      })
    )
    .optional(),
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

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { colors: true, sizes: true, images: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = updateSchema.parse(await req.json());

  const data: Record<string, unknown> = {};
  if (body.name) {
    data.name = body.name;
    data.slug = slugify(body.name);
  }
  if (body.description != null) data.description = body.description;
  if (body.price != null) data.price = body.price;
  if (body.promoPrice !== undefined) data.promoPrice = body.promoPrice;
  if (body.isLaunch != null) data.isLaunch = body.isLaunch;
  if (body.categoryId) data.categoryId = body.categoryId;

  await prisma.product.update({ where: { id }, data });

  if (body.colors) {
    await prisma.productSize.deleteMany({ where: { productId: id } });
    await prisma.productColor.deleteMany({ where: { productId: id } });
    await prisma.productColor.createMany({
      data: body.colors.map((c) => ({
        productId: id,
        name: c.name,
        hex: c.hex ?? null,
      })),
    });
    const colors = await prisma.productColor.findMany({ where: { productId: id } });
    await createSizesForColors(id, colors, body.colors);
  }

  if (body.images) {
    const colors = await prisma.productColor.findMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: body.images.map((img, i) => {
        const color = img.colorName
          ? colors.find((c) => c.name.toLowerCase() === img.colorName!.toLowerCase())
          : null;
        return {
          productId: id,
          url: img.url,
          sortOrder: img.sortOrder ?? i,
          colorId: color?.id ?? null,
        };
      }),
    });
  }

  const full = await prisma.product.findUnique({
    where: { id },
    include: { colors: true, sizes: true, images: true, category: true },
  });
  return NextResponse.json(full);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
