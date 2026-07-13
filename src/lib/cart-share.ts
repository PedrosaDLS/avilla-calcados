import { z } from "zod";

const shareItemSchema = z.object({
  slug: z.string().min(1),
  material: z.string().optional(),
  qty: z.number().int().min(1).max(20),
});

export const sharePayloadSchema = z.array(shareItemSchema).min(1).max(20);

export type CartShareItem = z.infer<typeof shareItemSchema>;

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function normalizeShareItems(
  items: {
    slug?: string;
    material?: string | null;
    qty: number;
  }[]
): CartShareItem[] {
  return sharePayloadSchema.parse(
    items
      .filter((item) => item.slug)
      .map((item) => ({
        slug: item.slug!,
        material: item.material ?? undefined,
        qty: item.qty,
      }))
  );
}

export function encodeCartShare(
  items: {
    slug?: string;
    material?: string | null;
    qty: number;
  }[]
) {
  return toBase64Url(JSON.stringify(normalizeShareItems(items)));
}

export function decodeCartShare(encoded: string): CartShareItem[] | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json);
    return sharePayloadSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function buildCartSharePath(
  itemsOrCode:
    | string
    | {
        slug?: string;
        material?: string | null;
        qty: number;
      }[]
) {
  if (typeof itemsOrCode === "string") {
    return `/carrinho/pedido/${itemsOrCode}`;
  }
  const encoded = encodeCartShare(itemsOrCode);
  return `/carrinho/pedido?d=${encodeURIComponent(encoded)}`;
}

export function buildCartShareUrl(
  origin: string,
  itemsOrCode:
    | string
    | {
        slug?: string;
        material?: string | null;
        qty: number;
      }[]
) {
  return `${origin}${buildCartSharePath(itemsOrCode)}`;
}
