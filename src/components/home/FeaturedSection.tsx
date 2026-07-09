"use client";

import { motion } from "framer-motion";
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
    <motion.div
      variants={section}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      <motion.h2
        variants={fadeUp}
        className="mb-8 font-[family-name:var(--font-display)] text-3xl md:text-4xl"
      >
        Modelos destaque
      </motion.h2>

      <motion.div variants={fadeUp}>
        <ProductGrid
          products={products}
          emptyMessage="Novos modelos em breve."
          staggerBase={0.12}
        />
      </motion.div>

      {products.length > 0 && (
        <motion.div variants={fadeUp} className="mt-20 flex justify-center md:mt-24">
          <RoundedSlideButton href="/colecao" variant="sand">
            Ver mais
          </RoundedSlideButton>
        </motion.div>
      )}
    </motion.div>
  );
}
