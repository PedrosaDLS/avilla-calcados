import { getProductBySlug } from "@/lib/catalog";
import { type CartShareItem } from "@/lib/cart-share";
import { effectivePrice } from "@/lib/utils";
import type { PedidoItemView } from "./PedidoClient";

export async function resolvePedidoItems(shared: CartShareItem[]) {
  const resolved = await Promise.all(
    shared.map(async (entry) => {
      const product = await getProductBySlug(entry.slug);
      if (!product) return null;

      const unit = effectivePrice(product.price, product.promoPrice);
      const imageUrl = product.images[0]?.url ?? null;

      return {
        name: product.name,
        slug: product.slug,
        imageUrl,
        material: entry.material ?? product.material ?? null,
        qty: entry.qty,
        lineTotal: unit * entry.qty,
      } satisfies PedidoItemView;
    })
  );

  const items = resolved.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { items, total };
}
