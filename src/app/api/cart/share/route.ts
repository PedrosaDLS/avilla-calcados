import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCartShareUrl } from "@/lib/cart-share";
import { createSharedOrder } from "@/lib/cart-share-server";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        material: z.string().nullable().optional(),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(20),
});

function resolveOrigin(req: Request) {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envOrigin) return envOrigin;

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const order = await createSharedOrder(body.items);
    const url = buildCartShareUrl(resolveOrigin(req), order.code);

    return NextResponse.json({ code: order.code, url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Não foi possível criar o link do pedido." },
      { status: 500 }
    );
  }
}
