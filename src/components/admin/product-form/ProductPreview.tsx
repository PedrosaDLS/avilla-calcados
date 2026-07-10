"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { formatBRL, effectivePrice } from "@/lib/utils";
import type { Category, ProductFormState } from "./types";

type PreviewProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice: number | null;
  isLaunch: boolean;
  category: { name: string };
  colors: { id: string; name: string; hex: string | null }[];
  sizes: { id: string; size: string; colorId: string }[];
  images: { id: string; url: string; colorId: string | null }[];
};

export function buildPreviewProduct(
  state: ProductFormState,
  categories: Category[]
): PreviewProduct {
  const category = categories.find((c) => c.id === state.categoryId);
  const colors = state.colors
    .filter((c) => c.name.trim())
    .map((c, i) => ({ id: `preview-color-${i}`, name: c.name.trim(), hex: c.hex }));

  const colorNameToId = Object.fromEntries(colors.map((c) => [c.name, c.id]));
  const sizes = state.colors
    .filter((c) => c.name.trim())
    .flatMap((c, i) => {
      const colorId = `preview-color-${i}`;
      return c.sizes.map((size, j) => ({
        id: `preview-size-${i}-${j}`,
        size,
        colorId,
      }));
    });

  const images = state.images.flatMap((img, i) =>
    (img.colorNames.length ? img.colorNames : [null]).map((colorName, j) => ({
      id: `preview-img-${i}-${j}`,
      url: img.url,
      colorId: colorName ? colorNameToId[colorName] ?? null : null,
    }))
  );

  return {
    id: "preview",
    name: state.name.trim() || "Nome do modelo",
    slug: "preview",
    description: state.description.trim(),
    price: Number(state.price) || 0,
    promoPrice: state.promoPrice.trim() ? Number(state.promoPrice) : null,
    isLaunch: state.isLaunch,
    category: { name: category?.name ?? "Categoria" },
    colors,
    sizes,
    images,
  };
}

export function ProductPreview({
  product,
}: {
  product: PreviewProduct;
}) {
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const availableSizes = product.sizes.filter((s) => s.colorId === colorId);
  const images = product.images.filter((img) => !img.colorId || img.colorId === colorId);
  const gallery = images.length ? images : product.images;
  const [activeImg, setActiveImg] = useState(gallery[0]?.url ?? null);

  useEffect(() => {
    setActiveImg(gallery[0]?.url ?? null);
  }, [colorId, gallery]);
  const price = effectivePrice(product.price, product.promoPrice);
  const hasPromo =
    product.promoPrice != null && product.promoPrice < product.price;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]">
      <p className="border-b border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Pré-visualização na loja
      </p>
      <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 md:gap-6">
        <div className="min-w-0">
          <div className="product-detail-gallery relative aspect-[4/5] w-full overflow-hidden bg-[var(--sand)] md:aspect-[3/4]">
            {activeImg ? (
              <Image
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
          {product.description && (
            <MarkdownContent content={product.description} className="mt-4 md:mt-5" />
          )}
          {product.colors.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    colorId === c.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)]"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ background: c.hex || "#ccc" }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {availableSizes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {availableSizes.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs"
                >
                  {s.size}
                </span>
              ))}
            </div>
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
  const category = categories.find((c) => c.id === state.categoryId);
  const colors = state.colors.filter((c) => c.name.trim());

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
          <dd className="text-right text-[var(--ink)]">{category?.name ?? "—"}</dd>
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
          <dt>Cores</dt>
          <dd className="text-right text-[var(--ink)]">{colors.length || "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Tamanhos</dt>
          <dd className="text-right text-[var(--ink)]">
            {colors.length
              ? colors
                  .map((c) =>
                    c.sizes.length ? `${c.name.trim()}: ${c.sizes.join(", ")}` : null
                  )
                  .filter(Boolean)
                  .join(" · ") || "—"
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Fotos</dt>
          <dd className="text-right text-[var(--ink)]">{state.images.length}</dd>
        </div>
      </dl>
    </div>
  );
}
