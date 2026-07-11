"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { formatBRL, effectivePrice } from "@/lib/utils";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  price: string | number;
  promoPrice: string | number | null;
  isLaunch: boolean;
  category: { name: string };
  images: { id: string; url: string }[];
};

function GalleryArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-[var(--line)] bg-[var(--bg-elevated)]/90 text-[var(--ink)] backdrop-blur-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:h-11 md:w-11"
      style={direction === "prev" ? { left: "0.75rem" } : { right: "0.75rem" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5"
        aria-hidden
      >
        {direction === "prev" ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/products/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    }).catch(() => {});
  }, [product.id]);

  const gallery = product.images;
  const activeImg = gallery[activeIndex]?.url ?? null;
  const hasMultiple = gallery.length > 1;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (!hasMultiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMultiple, goPrev, goNext]);

  const price = effectivePrice(product.price, product.promoPrice);
  const hasPromo =
    product.promoPrice != null && Number(product.promoPrice) < Number(product.price);

  async function addToCart() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          qty,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Erro ao adicionar");
        return;
      }
      setMsg("Adicionado ao carrinho");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2 md:gap-10 md:px-6 md:py-14">
      <div className="min-w-0">
        <div className="product-card-frame relative border border-[var(--line)] bg-[var(--bg-elevated)] p-2 md:p-3">
          <div className="product-detail-gallery relative aspect-[4/5] w-full overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]/60 md:aspect-[3/4]">
            {activeImg ? (
              <Image
                key={activeImg}
                src={activeImg}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : null}
            {hasMultiple && (
              <>
                <GalleryArrow direction="prev" onClick={goPrev} label="Imagem anterior" />
                <GalleryArrow direction="next" onClick={goNext} label="Próxima imagem" />
              </>
            )}
          </div>
        </div>

        {hasMultiple && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver imagem ${i + 1} de ${gallery.length}`}
                aria-current={activeIndex === i ? "true" : undefined}
                className={`product-card-frame shrink-0 border p-1 transition-[border-color,box-shadow] duration-300 ${
                  activeIndex === i
                    ? "border-[var(--accent)]"
                    : "border-[var(--line)] hover:border-[var(--accent)]/60"
                }`}
              >
                <span className="relative block h-20 w-16 overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]/60">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          {product.category.name}
          {product.isLaunch ? " · Lançamento" : ""}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className={`text-xl md:text-2xl ${hasPromo ? "text-[var(--accent)]" : ""}`}>
            {formatBRL(price)}
          </span>
          {hasPromo && (
            <span className="text-sm text-[var(--muted)] line-through md:text-base">
              {formatBRL(Number(product.price))}
            </span>
          )}
        </div>
        {product.material && (
          <p className="mt-5 text-sm text-[var(--muted)]">
            Material: <span className="text-[var(--ink)]">{product.material}</span>
          </p>
        )}
        {product.description && (
          <MarkdownContent content={product.description} className="mt-5 md:mt-6" />
        )}

        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm text-[var(--muted)]" htmlFor="qty">
            Qtd
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-20 border border-[var(--line)] bg-transparent px-3 py-2"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <RoundedSlideButton type="button" disabled={busy} onClick={addToCart}>
            {busy ? "Adicionando..." : "Adicionar ao carrinho"}
          </RoundedSlideButton>
          <WhatsAppButton
            item={{
              name: product.name,
              slug: product.slug,
              qty,
            }}
            className="sm:flex-1"
          />
        </div>
        {msg && <p className="mt-3 text-sm text-[var(--muted)]">{msg}</p>}
      </div>
    </div>
  );
}
