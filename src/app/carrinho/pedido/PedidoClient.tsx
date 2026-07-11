import Image from "next/image";
import Link from "next/link";
import { formatBRL } from "@/lib/utils";

export type PedidoItemView = {
  name: string;
  slug: string;
  imageUrl: string | null;
  material: string | null;
  qty: number;
  lineTotal: number;
};

export function PedidoClient({
  items,
  total,
  error,
}: {
  items: PedidoItemView[];
  total: number;
  error?: string;
}) {
  if (error || !items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Pedido</h1>
        <p className="mt-4 text-[var(--muted)]">
          {error ?? "Pedido inválido ou expirado."}
        </p>
        <Link
          href="/colecao"
          className="mt-8 inline-block text-sm text-[var(--ink)] underline"
        >
          Ver coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Pedido</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Resumo compartilhado pelo cliente
      </p>
      <ul className="mt-8 divide-y divide-[var(--line)]">
        {items.map((item, index) => (
          <li key={`${item.slug}-${index}`} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--sand)]">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/modelo/${item.slug}`} className="font-medium">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {[
                  item.material && `Material ${item.material}`,
                  `Qtd ${item.qty}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-3 text-sm">{formatBRL(item.lineTotal)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-[var(--line)] pt-6">
        <p className="text-lg">
          Total estimado: <strong>{formatBRL(total)}</strong>
        </p>
      </div>
    </div>
  );
}
