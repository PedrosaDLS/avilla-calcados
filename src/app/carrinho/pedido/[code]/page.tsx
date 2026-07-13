import { getSharedOrderItems } from "@/lib/cart-share-server";
import { PedidoClient } from "../PedidoClient";
import { resolvePedidoItems } from "../resolve-pedido";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function PedidoByCodePage({ params }: Props) {
  const { code } = await params;
  const shared = await getSharedOrderItems(code);

  if (!shared?.length) {
    return (
      <PedidoClient items={[]} total={0} error="Pedido inválido ou expirado." />
    );
  }

  const { items, total } = await resolvePedidoItems(shared);

  if (!items.length) {
    return (
      <PedidoClient items={[]} total={0} error="Pedido inválido ou expirado." />
    );
  }

  return <PedidoClient items={items} total={total} />;
}
