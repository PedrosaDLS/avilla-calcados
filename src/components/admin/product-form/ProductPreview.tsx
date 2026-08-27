"use client";

import { useState } from "react";
import Image from "next/image";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { formatBRL, effectivePrice } from "@/lib/utils";
import type { Category, ProductFormState } from "./types";
import { resolveCategoryName, resolveMaterial } from "./types";

export type PreviewProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice: number | null;
  isLaunch: boolean;
  material: string;
  category: { name: string };
  images: { id: string; url: string }[];
};

export function buildPreviewProduct(
  state: ProductFormState,
  categories: Category[]
): PreviewProduct {
  const categoryName = resolveCategoryName(state, categories);

  return {
    id: "preview",
    name: state.name.trim() || "Nome do modelo",
    slug: "preview",
    description: state.description.trim(),
    price: Number(state.price) || 0,
    promoPrice: state.promoPrice.trim() ? Number(state.promoPrice) : null,
    isLaunch: state.isLaunch,
    material: resolveMaterial(state),
    category: { name: categoryName || "Categoria" },
    images: state.images.map((img, i) => ({
      id: `preview-img-${i}`,
      url: img.url,
    })),
  };
}

export function ProductPreview({
  product,
  showLabel = true,
}: {
  product: PreviewProduct;
  showLabel?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = product.images;
  const activeImg = gallery[activeIndex]?.url ?? gallery[0]?.url ?? null;
  const hasMultiple = gallery.length > 1;
  const price = effectivePrice(product.price, product.promoPrice);
  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;

  return (
    <div className="overflow-hidden border border-[var(--line)] bg-[var(--bg-elevated)]">
      {showLabel ? (
        <p className="border-b border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Pré-visualização na loja
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <div className="product-detail-gallery relative aspect-[4/5] w-full overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]/60 md:aspect-[3/4]">
            {activeImg ? (
              <Image
                key={activeImg}
                src={activeImg}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                Sem foto
              </div>
            )}
          </div>
          {hasMultiple ? (
            <div className="mt-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver imagem ${i + 1} de ${gallery.length}`}
                  aria-current={activeIndex === i ? "true" : undefined}
                  className={`min-h-11 shrink-0 border p-1 transition-[border-color] duration-200 [-webkit-tap-highlight-color:transparent] ${
                    activeIndex === i
                      ? "border-[var(--accent)]"
                      : "border-[var(--line)] hover:border-[var(--accent)]/60"
                  }`}
                >
                  <span className="relative block h-16 w-12 overflow-hidden bg-[var(--sand)]">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {product.category.name}
            {product.isLaunch ? " · Lançamento" : ""}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight md:text-3xl">
            {product.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className={`text-lg md:text-xl ${hasPromo ? "text-[var(--accent)]" : ""}`}>
              {formatBRL(price)}
            </span>
            {hasPromo && (
              <span className="text-sm text-[var(--muted)] line-through">
                {formatBRL(product.price)}
              </span>
            )}
          </div>
          {product.material && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Material: <span className="text-[var(--ink)]">{product.material}</span>
            </p>
          )}
          {product.description && (
            <MarkdownContent content={product.description} className="mt-4 md:mt-5" />
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewSummary({
  state,
  categories,
}: {
  state: ProductFormState;
  categories: Category[];
}) {
  const categoryName = resolveCategoryName(state, categories);
  const material = resolveMaterial(state);

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4 text-sm">
      <h3 className="mb-3 font-medium">Resumo</h3>
      <dl className="space-y-2 text-[var(--muted)]">
        <div className="flex justify-between gap-4">
          <dt>Nome</dt>
          <dd className="text-right text-[var(--ink)]">{state.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Categoria</dt>
          <dd className="text-right text-[var(--ink)]">{categoryName || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Preço</dt>
          <dd className="text-right text-[var(--ink)]">
            {formatBRL(Number(state.price) || 0)}
            {state.promoPrice.trim() && (
              <span className="ml-2 text-[var(--accent)]">
                promo {formatBRL(Number(state.promoPrice))}
              </span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Material</dt>
          <dd className="text-right text-[var(--ink)]">{material || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Fotos</dt>
          <dd className="text-right text-[var(--ink)]">{state.images.length}</dd>
        </div>
      </dl>
    </div>
  );
}
