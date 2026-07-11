import { buildCartShareUrl } from "@/lib/cart-share";

export const WHATSAPP_NUMBER =
  process.env.WHATSAPP_NUMBER ?? "553898819074";

export type WhatsAppItem = {
  name: string;
  slug?: string;
  material?: string | null;
  qty: number;
};

const ORDER_OPENING = "Ola, Gostaria de fazer o seguinte pedido:";

export function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildProductPath(slug: string) {
  return `/modelo/${slug}`;
}

export function buildProductUrl(origin: string, slug: string) {
  return `${origin}${buildProductPath(slug)}`;
}

export function messageForProduct(item: WhatsAppItem, origin = "") {
  if (!origin || !item.slug) return ORDER_OPENING;
  const link = buildProductUrl(origin, item.slug);
  return `${ORDER_OPENING} ${link}`;
}

export function messageForCart(items: WhatsAppItem[], origin = "") {
  if (!origin || !items.length) return ORDER_OPENING;
  const link = buildCartShareUrl(origin, items);
  return `${ORDER_OPENING} ${link}`;
}
