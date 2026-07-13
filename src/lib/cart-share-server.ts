import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  normalizeShareItems,
  sharePayloadSchema,
  type CartShareItem,
} from "@/lib/cart-share";

const CODE_LENGTH = 8;
const SHARE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function createShareCode() {
  return randomBytes(6).toString("base64url").slice(0, CODE_LENGTH);
}

export async function createSharedOrder(
  items: {
    slug?: string;
    material?: string | null;
    qty: number;
  }[]
) {
  const payload = normalizeShareItems(items);
  const expiresAt = new Date(Date.now() + SHARE_TTL_MS);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = createShareCode();
    try {
      return await prisma.sharedOrder.create({
        data: {
          code,
          items: payload,
          expiresAt,
        },
      });
    } catch {
      // Unique collision on code — retry with a new one.
    }
  }

  throw new Error("Não foi possível gerar o link do pedido.");
}

export async function getSharedOrderItems(
  code: string
): Promise<CartShareItem[] | null> {
  const order = await prisma.sharedOrder.findUnique({
    where: { code },
  });
  if (!order) return null;
  if (order.expiresAt.getTime() < Date.now()) return null;

  try {
    return sharePayloadSchema.parse(order.items);
  } catch {
    return null;
  }
}
