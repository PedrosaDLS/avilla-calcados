import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GUEST_CART_COOKIE, getOrCreateUserCart, type GuestCartItem } from "@/lib/cart";

const itemSchema = z.object({
  productId: z.string().min(1),
  colorId: z.string().optional().nullable(),
  sizeId: z.string().optional().nullable(),
  qty: z.number().int().min(1).max(20).default(1),
});

function parseGuest(cookie?: string): GuestCartItem[] {
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie)) as GuestCartItem[];
  } catch {
    return [];
  }
}

function setGuestCookie(res: NextResponse, items: GuestCartItem[]) {
  res.cookies.set(GUEST_CART_COOKIE, encodeURIComponent(JSON.stringify(items)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });
    return NextResponse.json({ items: cart?.items ?? [] });
  }
  const cookie = req.headers.get("cookie")?.match(/avilla_cart=([^;]+)/)?.[1];
  return NextResponse.json({ items: parseGuest(cookie) });
}

export async function POST(req: Request) {
  const body = itemSchema.parse(await req.json());
  const product = await prisma.product.findUnique({
    where: { id: body.productId },
    include: { colors: true, sizes: true },
  });
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  if (product.colors.length && !body.colorId) {
    return NextResponse.json({ error: "Selecione a cor" }, { status: 400 });
  }
  if (product.sizes.length && !body.sizeId) {
    return NextResponse.json({ error: "Selecione o tamanho" }, { status: 400 });
  }
  if (body.sizeId) {
    const size = product.sizes.find((s) => s.id === body.sizeId);
    if (!size) {
      return NextResponse.json({ error: "Tamanho inválido" }, { status: 400 });
    }
    if (body.colorId && size.colorId !== body.colorId) {
      return NextResponse.json(
        { error: "Tamanho inválido para a cor selecionada" },
        { status: 400 }
      );
    }
  }

  const session = await auth();
  if (session?.user?.id) {
    const cart = await getOrCreateUserCart(session.user.id);
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: body.productId,
        colorId: body.colorId ?? null,
        sizeId: body.sizeId ?? null,
      },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + body.qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          colorId: body.colorId ?? null,
          sizeId: body.sizeId ?? null,
          qty: body.qty,
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const cookie = req.headers.get("cookie")?.match(/avilla_cart=([^;]+)/)?.[1];
  const items = parseGuest(cookie);
  const idx = items.findIndex(
    (i) =>
      i.productId === body.productId &&
      (i.colorId ?? null) === (body.colorId ?? null) &&
      (i.sizeId ?? null) === (body.sizeId ?? null)
  );
  if (idx >= 0) items[idx].qty += body.qty;
  else
    items.push({
      productId: body.productId,
      colorId: body.colorId ?? null,
      sizeId: body.sizeId ?? null,
      qty: body.qty,
    });
  const res = NextResponse.json({ ok: true });
  setGuestCookie(res, items);
  return res;
}

export async function PATCH(req: Request) {
  const schema = z.object({
    id: z.string(),
    qty: z.number().int().min(0).max(20),
  });
  const body = schema.parse(await req.json());
  const session = await auth();

  if (session?.user?.id) {
    if (body.qty === 0) {
      await prisma.cartItem.deleteMany({
        where: { id: body.id, cart: { userId: session.user.id } },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: body.id, cart: { userId: session.user.id } },
        data: { qty: body.qty },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const cookie = req.headers.get("cookie")?.match(/avilla_cart=([^;]+)/)?.[1];
  let items = parseGuest(cookie);
  const idx = Number(String(body.id).replace("guest-", ""));
  if (Number.isNaN(idx) || idx < 0 || idx >= items.length) {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  }
  if (body.qty === 0) items = items.filter((_, i) => i !== idx);
  else items[idx].qty = body.qty;
  const res = NextResponse.json({ ok: true });
  setGuestCookie(res, items);
  return res;
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const session = await auth();
  if (session?.user?.id) {
    await prisma.cartItem.deleteMany({
      where: { id, cart: { userId: session.user.id } },
    });
    return NextResponse.json({ ok: true });
  }

  const cookie = req.headers.get("cookie")?.match(/avilla_cart=([^;]+)/)?.[1];
  let items = parseGuest(cookie);
  const idx = Number(String(id).replace("guest-", ""));
  items = items.filter((_, i) => i !== idx);
  const res = NextResponse.json({ ok: true });
  setGuestCookie(res, items);
  return res;
}
