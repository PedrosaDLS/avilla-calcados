"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { effectivePrice, formatBRL } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  promoPrice?: number | string | null;
  isLaunch?: boolean;
  images: { url: string }[];
  category?: { name: string } | null;
};

export function ProductGrid({
  products,
  emptyMessage = "Nenhum modelo encontrado com esses filtros.",
  staggerBase = 0.05,
}: {
  products: ProductCardData[];
  emptyMessage?: string;
  staggerBase?: number;
}) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-[var(--muted)]">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
      {products.map((p, i) => {
        const price = effectivePrice(p.price, p.promoPrice);
        const hasPromo = p.promoPrice != null && Number(p.promoPrice) < Number(p.price);
        const img = p.images[0]?.url;

        return (
          <motion.div
            key={p.id}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (i % 4) * staggerBase,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link href={`/modelo/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--sand)]">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                ) : null}
                {p.isLaunch && (
                  <span className="absolute left-2 top-2 bg-[var(--ink)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--bg)]">
                    Lançamento
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-0.5">
                {p.category && (
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    {p.category.name}
                  </p>
                )}
                <h3 className="text-sm text-[var(--ink)] md:text-base">{p.name}</h3>
                <div className="flex items-baseline gap-2 text-sm">
                  <span className={hasPromo ? "text-[var(--accent)]" : ""}>
                    {formatBRL(price)}
                  </span>
                  {hasPromo && (
                    <span className="text-xs text-[var(--muted)] line-through">
                      {formatBRL(Number(p.price))}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
