import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Nome da categoria muito curto."),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = schema.parse(await req.json());
  const name = body.name.trim();

  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  let slug = slugify(name);
  if (!slug) slug = `categoria-${Date.now().toString(36)}`;
  const slugTaken = await prisma.category.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;

  const category = await prisma.category.create({
    data: { name, slug },
  });

  revalidateCatalog();

  return NextResponse.json(category, { status: 201 });
}
