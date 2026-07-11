"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { formatBRL } from "@/lib/utils";

type CartItemView = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  material: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export function CartClient({
  items,
  total,
  error,
}: {
  items: CartItemView[];
  total: number;
  error?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function updateQty(id: string, qty: number) {
    setBusy(id);
    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qty }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Carrinho</h1>
        <p className="mt-4 text-[var(--muted)]">{error}</p>
        <div className="mt-8 flex justify-center">
          <RoundedSlideButton href="/colecao">Ver coleção</RoundedSlideButton>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Carrinho</h1>
        <p className="mt-4 text-[var(--muted)]">Seu carrinho está vazio.</p>
        <div className="mt-8 flex justify-center">
          <RoundedSlideButton href="/colecao">Ver coleção</RoundedSlideButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Carrinho</h1>
      <ul className="mt-8 divide-y divide-[var(--line)]">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--sand)]">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={item.imageUrl.startsWith("/uploads/")}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/modelo/${item.slug}`} className="font-medium">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {[item.material && `Material ${item.material}`, `Qtd ${item.qty}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={item.qty}
                  disabled={busy === item.id}
                  onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 border border-[var(--line)] bg-transparent px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  className="text-sm text-[var(--muted)] underline"
                  onClick={() => updateQty(item.id, 0)}
                >
                  Remover
                </button>
                <span className="ml-auto text-sm">{formatBRL(item.lineTotal)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg">
          Total estimado: <strong>{formatBRL(total)}</strong>
        </p>
        <WhatsAppButton
          items={items.map((i) => ({
            name: i.name,
            slug: i.slug,
            material: i.material,
            qty: i.qty,
          }))}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
