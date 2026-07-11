import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { effectivePrice } from "@/lib/utils";

export const GUEST_CART_COOKIE = "avilla_cart";

export type GuestCartItem = {
  productId: string;
  qty: number;
};

export type CartView = {
  items: Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    material: string | null;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  total: number;
  source: "user" | "guest";
  error?: string;
};

function normalizeGuestItem(item: unknown): GuestCartItem | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const productId = typeof row.productId === "string" ? row.productId : "";
  const qty = Number(row.qty);
  if (!productId || !Number.isFinite(qty) || qty < 1) return null;
  return { productId, qty: Math.min(20, Math.floor(qty)) };
}

export function parseGuestCartValue(raw?: string | null): GuestCartItem[] {
  if (!raw) return [];

  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    /* ignore */
  }
  try {
    candidates.push(decodeURIComponent(decodeURIComponent(raw)));
  } catch {
    /* ignore */
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!Array.isArray(parsed)) continue;
      const items = parsed
        .map(normalizeGuestItem)
        .filter((item): item is GuestCartItem => item !== null);
      if (items.length) return items;
    } catch {
      /* try next candidate */
    }
  }

  return [];
}

export async function readGuestCart(): Promise<GuestCartItem[]> {
  const jar = await cookies();
  const raw = jar.get(GUEST_CART_COOKIE)?.value;
  return parseGuestCartValue(raw);
}

export async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartView(): Promise<CartView> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      const cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
            },
          },
        },
      });
      const items = (cart?.items ?? [])
        .filter((item) => item.product)
        .map((item) => {
          const unit = effectivePrice(item.product.price, item.product.promoPrice);
          return {
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            slug: item.product.slug,
            imageUrl: item.product.images[0]?.url ?? null,
            material: item.product.material || null,
            qty: item.qty,
            unitPrice: unit,
            lineTotal: unit * item.qty,
          };
        });
      const total = items.reduce((s, i) => s + i.lineTotal, 0);
      return { items, total, source: "user" };
    }

    const guest = await readGuestCart();
    if (!guest.length) return { items: [], total: 0, source: "guest" };

    const products = await prisma.product.findMany({
      where: { id: { in: guest.map((g) => g.productId) } },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const items = guest
      .map((g, idx) => {
        const product = byId.get(g.productId);
        if (!product) return null;
        const unit = effectivePrice(product.price, product.promoPrice);
        return {
          id: `guest-${idx}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.images[0]?.url ?? null,
          material: product.material || null,
          qty: g.qty,
          unitPrice: unit,
          lineTotal: unit * g.qty,
        };
      })
      .filter(Boolean) as CartView["items"];

    const total = items.reduce((s, i) => s + i.lineTotal, 0);
    return { items, total, source: "guest" };
  } catch {
    return {
      items: [],
      total: 0,
      source: "guest",
      error: "Não foi possível carregar o carrinho. Tente novamente em instantes.",
    };
  }
}
