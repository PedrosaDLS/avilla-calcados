import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { effectivePrice } from "@/lib/utils";

export const GUEST_CART_COOKIE = "avilla_cart";

export type GuestCartItem = {
  productId: string;
  colorId?: string | null;
  sizeId?: string | null;
  qty: number;
};

export async function readGuestCart(): Promise<GuestCartItem[]> {
  const jar = await cookies();
  const raw = jar.get(GUEST_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as GuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartView() {
  const session = await auth();
  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
            color: true,
            size: true,
          },
        },
      },
    });
    const items = (cart?.items ?? []).map((item) => {
      const unit = effectivePrice(item.product.price, item.product.promoPrice);
      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.images[0]?.url ?? null,
        colorId: item.colorId,
        colorName: item.color?.name ?? null,
        sizeId: item.sizeId,
        sizeLabel: item.size?.size ?? null,
        qty: item.qty,
        unitPrice: unit,
        lineTotal: unit * item.qty,
      };
    });
    const total = items.reduce((s, i) => s + i.lineTotal, 0);
    return { items, total, source: "user" as const };
  }

  const guest = await readGuestCart();
  if (!guest.length) return { items: [], total: 0, source: "guest" as const };

  const products = await prisma.product.findMany({
    where: { id: { in: guest.map((g) => g.productId) } },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      colors: true,
      sizes: true,
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = guest
    .map((g, idx) => {
      const product = byId.get(g.productId);
      if (!product) return null;
      const color = product.colors.find((c) => c.id === g.colorId);
      const size = product.sizes.find((s) => s.id === g.sizeId);
      const unit = effectivePrice(product.price, product.promoPrice);
      return {
        id: `guest-${idx}`,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.images[0]?.url ?? null,
        colorId: g.colorId ?? null,
        colorName: color?.name ?? null,
        sizeId: g.sizeId ?? null,
        sizeLabel: size?.size ?? null,
        qty: g.qty,
        unitPrice: unit,
        lineTotal: unit * g.qty,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    colorId: string | null;
    colorName: string | null;
    sizeId: string | null;
    sizeLabel: string | null;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  return { items, total, source: "guest" as const };
}
