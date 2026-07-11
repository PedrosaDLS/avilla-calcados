import { getCartView } from "@/lib/cart";
import { CartClient } from "./CartClient";

export default async function CarrinhoPage() {
  const { items, total, error } = await getCartView();
  return <CartClient items={items} total={total} error={error} />;
}
