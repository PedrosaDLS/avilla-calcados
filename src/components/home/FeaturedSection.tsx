"use client";

import { m } from "framer-motion";
import { ProductGrid, type ProductCardData } from "@/components/product/ProductGrid";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

const section = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturedSection({ products }: { products: ProductCardData[] }) {
  return (
    <m.div
      variants={section}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      <m.h2
        variants={fadeUp}
        className="mb-8 font-[family-name:var(--font-display)] text-3xl md:text-4xl"
      >
        Modelos destaque
      </m.h2>

      <m.div variants={fadeUp}>
        <ProductGrid
          products={products}
          emptyMessage="Novos modelos em breve."
          priorityCount={4}
          staggerBase={0.12}
          imageAspectClass="aspect-square"
        />
      </m.div>

      {products.length > 0 && (
        <m.div variants={fadeUp} className="mt-20 flex justify-center md:mt-24">
          <RoundedSlideButton href="/colecao" variant="sand">
            Ver mais
          </RoundedSlideButton>
        </m.div>
      )}
    </m.div>
  );
}
