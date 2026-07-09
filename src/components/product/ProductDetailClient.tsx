"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { formatBRL, effectivePrice } from "@/lib/utils";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  promoPrice: string | number | null;
  isLaunch: boolean;
  category: { name: string };
  colors: { id: string; name: string; hex: string | null }[];
  sizes: { id: string; size: string }[];
  images: { id: string; url: string; colorId: string | null }[];
};

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(product.sizes[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/products/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    }).catch(() => {});
  }, [product.id]);

  const images = product.images.filter((img) => !img.colorId || img.colorId === colorId);
  const gallery = images.length ? images : product.images;
  const [activeImg, setActiveImg] = useState(gallery[0]?.url ?? null);

  useEffect(() => {
    setActiveImg(gallery[0]?.url ?? null);
  }, [colorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = effectivePrice(product.price, product.promoPrice);
  const hasPromo =
    product.promoPrice != null && Number(product.promoPrice) < Number(product.price);
  const colorName = product.colors.find((c) => c.id === colorId)?.name;
  const sizeLabel = product.sizes.find((s) => s.id === sizeId)?.size;

  async function addToCart() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          colorId: colorId || null,
          sizeId: sizeId || null,
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
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:px-6 md:py-14">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--sand)]">
          {activeImg ? (
            <Image src={activeImg} alt={product.name} fill className="object-cover" sizes="50vw" />
          ) : null}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {gallery.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImg(img.url)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden border ${
                  activeImg === img.url ? "border-[var(--ink)]" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
          {product.category.name}
          {product.isLaunch ? " · Lançamento" : ""}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className={`text-2xl ${hasPromo ? "text-[var(--accent)]" : ""}`}>
            {formatBRL(price)}
          </span>
          {hasPromo && (
            <span className="text-[var(--muted)] line-through">
              {formatBRL(Number(product.price))}
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-6 leading-relaxed text-[var(--muted)]">{product.description}</p>
        )}

        {product.colors.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Cor</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  className={`flex items-center gap-2 border px-3 py-2 text-sm ${
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
          </div>
        )}

        {product.sizes.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Numeração</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeId(s.id)}
                  className={`min-w-11 border px-3 py-2 text-sm ${
                    sizeId === s.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)]"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
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
              color: colorName,
              size: sizeLabel,
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
