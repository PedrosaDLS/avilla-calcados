"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import BlurText from "@/components/effects/BlurText";
import LiquidEther from "@/components/effects/LiquidEther";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

export type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

/* Light: very soft cream ink. Dark: muted amber ink. */
const LIGHT_ETHER = ["#fffefb", "#faf7f3", "#f3ede6"];
const DARK_ETHER = ["#f5dcc4", "#e8c4a0", "#d4a574"];

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

function StaticSquare({ product }: { product: HeroProduct | undefined }) {
  if (!product) {
    return <div className="bg-[var(--sand)]" />;
  }

  return (
    <Link
      href={`/modelo/${product.slug}`}
      className="relative block h-full overflow-hidden bg-[var(--bg-elevated)]"
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width:768px) 45vw, 240px"
        />
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center bg-[var(--sand)] text-sm text-[var(--muted)]">
          {product.name}
        </div>
      )}
    </Link>
  );
}

function ShuffleSquare({
  products,
  intervalMs,
}: {
  products: HeroProduct[];
  intervalMs: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (products.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [products.length, intervalMs]);

  const product = products[index % products.length];
  if (!product) {
    return <div className="bg-[var(--sand)]" />;
  }

  return (
    <Link
      href={`/modelo/${product.slug}`}
      className="relative overflow-hidden bg-[var(--bg-elevated)]"
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={product.id + String(index)}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 45vw, 240px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--sand)] text-sm text-[var(--muted)]">
              {product.name}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Link>
  );
}

export function ShuffleHero({ products }: { products: HeroProduct[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const dark = useIsDark();
  const etherColors = dark ? DARK_ETHER : LIGHT_ETHER;

  const pool = useMemo(() => {
    const list = products.length ? [...products] : [];
    while (list.length > 0 && list.length < 4) list.push(...products);
    return list;
  }, [products]);

  const squares = useMemo(() => {
    if (!pool.length) return [[], [], [], []] as HeroProduct[][];
    return [0, 1, 2, 3].map((slot) => {
      const rotated = [...pool.slice(slot), ...pool.slice(0, slot)];
      return rotated;
    });
  }, [pool]);

  const intervals = [2800, 3400, 3100, 3900];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-[var(--line)] bg-[var(--bg)] md:min-h-[calc(100vh-5rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full md:block"
      >
        <LiquidEther
          key={dark ? "dark" : "light"}
          boundsRef={heroRef}
          colors={etherColors}
          mouseForce={10}
          cursorSize={72}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.4}
          isBounce={false}
          autoDemo
          autoSpeed={0.28}
          autoIntensity={1.0}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 pt-6 pb-12 md:min-h-[calc(100vh-5rem)] md:grid-cols-2 md:px-6 md:pt-8 md:pb-16">
        <div className="relative text-[var(--ink)]">
          <div className="md:hidden">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Calçados femininos
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--ink)]">
              Elegância que caminha com você
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)]">
              Peças selecionadas para o cotidiano sofisticado. Descubra a coleção Àvilla — forma,
              conforto e presença em cada passo.
            </p>
          </div>
          <div className="hidden md:block">
            <BlurText
              text="Calçados femininos"
              delay={80}
              animateBy="words"
              direction="top"
              as="p"
              className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--muted)]"
            />
            <BlurText
              text="Elegância que caminha com você"
              delay={120}
              animateBy="words"
              direction="top"
              as="h1"
              className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--ink)] md:text-6xl"
            />
            <BlurText
              text="Peças selecionadas para o cotidiano sofisticado. Descubra a coleção Àvilla — forma, conforto e presença em cada passo."
              delay={40}
              animateBy="words"
              direction="top"
              as="p"
              className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)] md:text-lg"
            />
          </div>
          <div className="relative mt-8">
            <RoundedSlideButton href="/colecao" variant="primary">
              Ver coleção
            </RoundedSlideButton>
          </div>
        </div>

        <div className="grid aspect-square max-h-[520px] grid-cols-2 grid-rows-2 gap-3 md:hidden">
          {squares.map((list, i) => (
            <StaticSquare key={i} product={list[0] ?? pool[0]} />
          ))}
          {!pool.length &&
            [0, 1, 2, 3].map((i) => <div key={i} className="bg-[var(--sand)]" />)}
        </div>

        <div className="hidden aspect-square max-h-[520px] grid-cols-2 grid-rows-2 gap-4 md:grid">
          {squares.map((list, i) => (
            <ShuffleSquare key={i} products={list.length ? list : pool} intervalMs={intervals[i]} />
          ))}
          {!pool.length &&
            [0, 1, 2, 3].map((i) => <div key={i} className="bg-[var(--sand)]" />)}
        </div>
      </div>
    </section>
  );
}
