import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  price: z.number().positive().optional(),
  promoPrice: z.number().positive().nullable().optional(),
  isLaunch: z.boolean().optional(),
  categoryId: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
});

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true },
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

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  const data: Record<string, unknown> = {};
  if (body.name) {
    data.name = body.name;
    data.slug = slugify(body.name);
  }
  if (body.description != null) data.description = body.description;
  if (body.material != null) data.material = body.material;
  if (body.price != null) data.price = body.price;
  if (body.promoPrice !== undefined) data.promoPrice = body.promoPrice;
  if (body.isLaunch != null) data.isLaunch = body.isLaunch;
  if (body.categoryId) data.categoryId = body.categoryId;

  await prisma.product.update({ where: { id }, data });

  await prisma.productSize.deleteMany({ where: { productId: id } });
  await prisma.productColor.deleteMany({ where: { productId: id } });

  if (body.images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: body.images.map((img, i) => ({
        productId: id,
        url: img.url,
        sortOrder: img.sortOrder ?? i,
        colorId: null,
      })),
    });
  }

  const full = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true },
  });

  revalidateCatalog(full?.slug ?? existing?.slug);

  return NextResponse.json(full);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = z.object({ isHidden: z.boolean() }).parse(await req.json());

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const full = await prisma.product.update({
    where: { id },
    data: { isHidden: body.isHidden },
    include: { images: true, category: true },
  });

  revalidateCatalog(existing.slug);

  return NextResponse.json(full);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  await prisma.product.delete({ where: { id } });

  revalidateCatalog(existing?.slug);

  return NextResponse.json({ ok: true });
}
