"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatBRL, effectivePrice } from "@/lib/utils";
import {
  ProductPreview,
  type PreviewProduct,
} from "@/components/admin/product-form/ProductPreview";
import { DeleteProductButton } from "./DeleteProductButton";
import { FeatureProductButton } from "./FeatureProductButton";
import { HideProductButton } from "./HideProductButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { AdminProductThumb } from "./AdminProductThumb";

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4.2L19.4 8.8a1.6 1.6 0 0 0 0-2.3L17.5 4.6a1.6 1.6 0 0 0-2.3 0L4 15.8V20Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 6.3l4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type AdminModeloListItem = PreviewProduct & {
  isHidden: boolean;
  viewCount: number;
};

export function AdminModelosList({ products }: { products: AdminModeloListItem[] }) {
  const [preview, setPreview] = useState<AdminModeloListItem | null>(null);
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);

  const close = useCallback(() => setPreview(null), []);

  useEffect(() => {
    if (!preview) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    // iOS Safari ignores overflow:hidden alone — pin body while open.
    scrollYRef.current = window.scrollY;
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };
    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollYRef.current}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";

    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      window.scrollTo(0, scrollYRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [preview, close]);

  return (
    <>
      <ul className="space-y-2">
        {products.map((p) => (
          <li
            key={p.id}
            className={`border border-[var(--line)] bg-[var(--bg-elevated)] p-3 transition-[border-color,background-color] duration-200 sm:p-4 ${
              p.isHidden ? "border-dashed bg-[var(--sand)]/35" : ""
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                onClick={() => setPreview(p)}
                className="flex min-w-0 flex-1 items-start gap-3 rounded-sm text-left transition [-webkit-tap-highlight-color:transparent] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:opacity-80"
                aria-label={`Pré-visualizar ${p.name}`}
              >
                <AdminProductThumb src={p.images[0]?.url} alt={p.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate font-medium text-[var(--ink)]">{p.name}</p>
                    {p.isLaunch ? (
                      <span className="inline-flex shrink-0 bg-[var(--sand)] px-1.5 py-0.5 text-[11px] tracking-wide text-[var(--ink)]">
                        Destaque
                      </span>
                    ) : null}
                    {p.isHidden ? (
                      <span className="inline-flex shrink-0 bg-[var(--sand)] px-1.5 py-0.5 text-[11px] tracking-wide text-[var(--muted)]">
                        Oculto no catálogo
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {p.category.name} · {formatBRL(effectivePrice(p.price, p.promoPrice))}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {p.viewCount} {p.viewCount === 1 ? "visualização" : "visualizações"}
                  </p>
                </div>
              </button>

              <div className="flex shrink-0 items-center justify-end gap-1 border-t border-[var(--line)] pt-3 sm:border-0 sm:pt-0">
                <Link
                  href={`/admin/modelos/${p.id}`}
                  aria-label={`Editar ${p.name}`}
                  title="Editar"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--ink)] transition hover:bg-[var(--sand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <PencilIcon />
                </Link>
                <HideProductButton id={p.id} isHidden={p.isHidden} name={p.name} />
                <FeatureProductButton id={p.id} isLaunch={p.isLaunch} name={p.name} />
                <CopyLinkButton
                  path={`/modelo/${p.slug}`}
                  title={`Copiar link da página de ${p.name}`}
                />
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--ink)]/40 p-0 sm:items-center sm:p-6"
          role="presentation"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[min(92dvh,92vh)] w-full max-w-3xl flex-col overflow-hidden border border-[var(--line)] bg-[var(--bg)] shadow-lg sm:max-h-[min(90dvh,90vh)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
              <h2 id={titleId} className="text-sm font-medium text-[var(--ink)]">
                Preview do modelo
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--muted)] transition [-webkit-tap-highlight-color:transparent] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label="Fechar preview"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [-webkit-overflow-scrolling:touch] sm:p-4">
              <ProductPreview key={preview.id} product={preview} showLabel={false} />
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3">
              <Link
                href={`/modelo/${preview.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center px-3 text-sm text-[var(--muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Abrir no catálogo
              </Link>
              <Link
                href={`/admin/modelos/${preview.id}`}
                className="inline-flex min-h-11 items-center border border-[var(--line)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--ink)] transition hover:border-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Editar
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
