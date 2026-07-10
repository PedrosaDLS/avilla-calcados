"use client";

import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

export type { ProductCardData };

export function ProductGrid({
  products,
  emptyMessage = "Nenhum modelo encontrado com esses filtros.",
  staggerBase = 0.05,
  imageAspectClass = "aspect-[4/5]",
}: {
  products: ProductCardData[];
  emptyMessage?: string;
  staggerBase?: number;
  imageAspectClass?: string;
}) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-[var(--muted)]">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          motionDelay={(i % 4) * staggerBase}
          imageAspectClass={imageAspectClass}
        />
      ))}
    </div>
  );
}
