import { getProductBySlug } from "@/lib/catalog";
import { decodeCartShare } from "@/lib/cart-share";
import { effectivePrice } from "@/lib/utils";
import { PedidoClient } from "./PedidoClient";

type Props = {
  searchParams: Promise<{ d?: string }>;
};

export default async function PedidoPage({ searchParams }: Props) {
  const { d } = await searchParams;
  const shared = d ? decodeCartShare(d) : null;

  if (!shared?.length) {
    return (
      <PedidoClient items={[]} total={0} error="Pedido inválido ou expirado." />
    );
  }

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
      };
    })
  );

  const items = resolved.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  if (!items.length) {
    return (
      <PedidoClient items={[]} total={0} error="Pedido inválido ou expirado." />
    );
  }

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return <PedidoClient items={items} total={total} />;
}
