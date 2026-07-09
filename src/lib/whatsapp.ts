export const WHATSAPP_NUMBER =
  process.env.WHATSAPP_NUMBER ?? "553898819074";

export type WhatsAppItem = {
  name: string;
  color?: string | null;
  size?: string | null;
  qty: number;
  price?: number;
};

export function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function messageForProduct(item: WhatsAppItem) {
  const parts = [
    `Olá! Quero pedir: ${item.name}`,
    item.color ? `Cor: ${item.color}` : null,
    item.size ? `Núm: ${item.size}` : null,
    `Qtd: ${item.qty}`,
  ].filter(Boolean);
  return parts.join(" | ");
}

export function messageForCart(items: WhatsAppItem[], total?: number) {
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
    return bits.join(" — ");
  });
  const header = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
  const footer =
    total != null ? `\n\nTotal estimado: R$ ${total.toFixed(2)}` : "";
  return header + lines.join("\n") + footer;
}
