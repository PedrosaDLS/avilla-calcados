export const WHATSAPP_NUMBER =
  process.env.WHATSAPP_NUMBER ?? "553898819074";

export type WhatsAppItem = {
  name: string;
  slug?: string;
  color?: string | null;
  size?: string | null;
  qty: number;
  price?: number;
};

export function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildProductPath(
  slug: string,
  opts?: { color?: string | null; size?: string | null }
) {
  const params = new URLSearchParams();
  if (opts?.color) params.set("cor", opts.color);
  if (opts?.size) params.set("tamanho", opts.size);
  const qs = params.toString();
  return `/modelo/${slug}${qs ? `?${qs}` : ""}`;
}

export function buildProductUrl(
  origin: string,
  slug: string,
  opts?: { color?: string | null; size?: string | null }
) {
  return `${origin}${buildProductPath(slug, opts)}`;
}

function itemLink(origin: string, item: WhatsAppItem) {
  if (!origin || !item.slug) return null;
  return buildProductUrl(origin, item.slug, {
    color: item.color,
    size: item.size,
  });
}

export function messageForProduct(item: WhatsAppItem, origin = "") {
  const parts = [
    `Olá! Quero pedir: ${item.name}`,
    item.color ? `Cor: ${item.color}` : null,
    item.size ? `Núm: ${item.size}` : null,
    `Qtd: ${item.qty}`,
  ].filter(Boolean);
  const link = itemLink(origin, item);
  return link ? `${parts.join(" | ")}\n${link}` : parts.join(" | ");
}

export function messageForCart(items: WhatsAppItem[], total?: number, origin = "") {
  const lines = items.map((item, i) => {
    const bits = [
      `${i + 1}. ${item.name}`,
      item.color ? `Cor ${item.color}` : null,
      item.size ? `Núm ${item.size}` : null,
      `x${item.qty}`,
      item.price != null
        ? `R$ ${(item.price * item.qty).toFixed(2)}`
        : null,
    ].filter(Boolean);
    const link = itemLink(origin, item);
    return link ? `${bits.join(" — ")}\n${link}` : bits.join(" — ");
  });
  const header = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
  const footer =
    total != null ? `\n\nTotal estimado: R$ ${total.toFixed(2)}` : "";
  return header + lines.join("\n\n") + footer;
}
