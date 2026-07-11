"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { pickRandomExcluding, pickRandomUnique } from "@/lib/shuffle";

const LiquidEther = dynamic(() => import("@/components/effects/LiquidEther"), {
  ssr: false,
});

const BlurText = dynamic(() => import("@/components/effects/BlurText"), {
  ssr: false,
});

export type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

const SLOT_COUNT = 4;
const INTERVALS = [2800, 3400, 3100, 3900];

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

function useDeferredMount(delayMs = 800) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setReady(true), { timeout: delayMs });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 100);
    return () => window.clearTimeout(id);
  }, [delayMs]);
  return ready;
}

function buildInitialSlots(pool: HeroProduct[]): (HeroProduct | null)[] {
  if (!pool.length) {
    return Array.from({ length: SLOT_COUNT }, () => null);
  }

  const unique = pickRandomUnique(pool, SLOT_COUNT, (p) => p.id);
  const slots: (HeroProduct | null)[] = [...unique];

  while (slots.length < SLOT_COUNT) {
    slots.push(pool[slots.length % pool.length] ?? null);
  }

  return slots.slice(0, SLOT_COUNT);
}

function ShuffleSquare({
  product,
  intervalMs,
  onTick,
  priority = false,
  className = "",
}: {
  product: HeroProduct | null;
  intervalMs: number;
  onTick: () => void;
  priority?: boolean;
  className?: string;
}) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!product) return;
    const id = setInterval(() => onTickRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [product, intervalMs]);

  if (!product) {
    return <div className="bg-[var(--sand)]" />;
  }

  return (
    <Link
      href={`/modelo/${product.slug}`}
      className={`relative block h-full overflow-hidden bg-[var(--bg-elevated)] ${className}`}
    >
      <AnimatePresence mode="popLayout">
        <m.div
          key={product.id}
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
              priority={priority}
              className="object-cover"
              sizes="(max-width:768px) 45vw, 240px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--sand)] text-sm text-[var(--muted)]">
              {product.name}
            </div>
          )}
        </m.div>
      </AnimatePresence>
    </Link>
  );
}

export function ShuffleHero({ products }: { products: HeroProduct[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const dark = useIsDark();
  const etherReady = useDeferredMount();
  const [etherResolution, setEtherResolution] = useState(0.4);
  const etherColors = dark ? DARK_ETHER : LIGHT_ETHER;
  const poolRef = useRef(products);
  poolRef.current = products;

  useEffect(() => {
    setEtherResolution(Math.min(0.5, 0.35 * (window.devicePixelRatio || 1)));
  }, []);

  const [visibleBySlot, setVisibleBySlot] = useState<(HeroProduct | null)[]>(() =>
    buildInitialSlots(products)
  );

  const rotateSlot = useCallback((slotIndex: number) => {
    const pool = poolRef.current;
    if (pool.length < 2) return;

    setVisibleBySlot((current) => {
      const exclude = new Set(
        current
          .map((item, i) => (i === slotIndex ? null : item?.id))
          .filter((id): id is string => id != null)
      );
      const next = pickRandomExcluding(pool, exclude, (p) => p.id);
      if (!next) return current;

      const updated = [...current];
      updated[slotIndex] = next;
      return updated;
    });
  }, []);

  const slotTickHandlers = useRef([
    () => rotateSlot(0),
    () => rotateSlot(1),
    () => rotateSlot(2),
    () => rotateSlot(3),
  ]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-[var(--line)] bg-[var(--bg)] md:min-h-[calc(100vh-5rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full md:block"
      >
        {etherReady && (
          <LiquidEther
            key={dark ? "dark" : "light"}
            boundsRef={heroRef}
            colors={etherColors}
            mouseForce={10}
            cursorSize={72}
            isViscous={false}
            viscous={30}
            iterationsViscous={24}
            iterationsPoisson={24}
            resolution={etherResolution}
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
        )}
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 pt-6 pb-12 md:min-h-[calc(100vh-5rem)] md:grid-cols-2 md:px-6 md:pt-8 md:pb-16">
        <div className="relative text-[var(--ink)]">
          <div className="md:hidden">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Ávilla Calçados
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--ink)]">
              Conforto que caminha com você
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)]">
              Moda, qualidade e conforto
            </p>
          </div>
          <div className="hidden md:block">
            <BlurText
              text="Ávilla Calçados"
              delay={80}
              animateBy="words"
              direction="top"
              as="p"
              className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--muted)]"
            />
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--ink)] md:text-6xl">
              Conforto que caminha com você
            </h1>
            <BlurText
              text="Moda, qualidade e conforto"
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

        <div className="grid aspect-square max-h-[520px] grid-cols-2 grid-rows-2 gap-3 md:gap-4">
          {visibleBySlot.map((product, i) => (
            <ShuffleSquare
              key={i}
              product={product}
              intervalMs={INTERVALS[i]}
              onTick={slotTickHandlers.current[i]}
              priority={i < 2}
            />
          ))}
          {!products.length &&
            Array.from({ length: SLOT_COUNT }, (_, i) => (
              <div key={i} className="bg-[var(--sand)]" />
            ))}
        </div>
      </div>
    </section>
  );
}
