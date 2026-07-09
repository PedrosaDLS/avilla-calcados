import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { productId } = (await req.json()) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "productId" }, { status: 400 });

  const jar = await cookies();
  const key = `viewed_${productId}`;
  if (jar.get(key)?.value === "1") {
    return NextResponse.json({ ok: true, counted: false });
  }

  await prisma.product.update({
    where: { id: productId },
    data: { viewCount: { increment: 1 } },
  });

  const res = NextResponse.json({ ok: true, counted: true });
  res.cookies.set(key, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
  return res;
}
