"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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

type Props = {
  product: ProductCardData;
  motionDelay?: number;
  imageAspectClass?: string;
};

export function ProductCard({
  product,
  motionDelay = 0,
  imageAspectClass = "aspect-[4/5]",
}: Props) {
  const reduceMotion = useReducedMotion();
  const price = effectivePrice(product.price, product.promoPrice);
  const hasPromo =
    product.promoPrice != null && Number(product.promoPrice) < Number(product.price);
  const img = product.images[0]?.url;

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: motionDelay,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="group"
    >
      <Link href={`/modelo/${product.slug}`} className="block">
        <div className="product-card-frame border border-[var(--line)] bg-[var(--bg-elevated)] p-2 transition-[border-color,box-shadow] duration-500 ease-out md:p-2.5">
          <div
            className={`relative ${imageAspectClass} overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]/60`}
          >
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                className={`object-cover transition duration-500 ease-out ${
                  reduceMotion ? "" : "group-hover:scale-105"
                }`}
                sizes="(max-width:768px) 50vw, 25vw"
              />
            ) : null}
            {product.isLaunch && (
              <span className="absolute left-2 top-2 bg-[var(--ink)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--bg)]">
                Lançamento
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1 px-0.5">
          {product.category && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
              {product.category.name}
            </p>
          )}
          <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent)] md:text-lg">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 text-sm">
            <span className={hasPromo ? "text-[var(--accent)]" : ""}>{formatBRL(price)}</span>
            {hasPromo && (
              <span className="text-xs text-[var(--muted)] line-through">
                {formatBRL(Number(product.price))}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
