import slugifyLib from "slugify";

export function slugify(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: "pt" });
}

export function toNumber(value: number | string | { toString(): string }) {
  return typeof value === "number" ? value : Number(value.toString());
}

export function formatBRL(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(value));
}

export function effectivePrice(
  price: number | string | { toString(): string },
  promoPrice?: number | string | { toString(): string } | null
) {
  const p = toNumber(price);
  const promo = promoPrice != null ? toNumber(promoPrice) : null;
  if (promo != null && !Number.isNaN(promo) && promo < p) return promo;
  return p;
}
