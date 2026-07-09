"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

type Category = { id: string; name: string };
type Initial = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  promoPrice?: number | null;
  isLaunch?: boolean;
  categoryId?: string;
  colors?: { name: string; hex: string | null }[];
  sizes?: string[];
  images?: { url: string; colorName?: string | null }[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Initial;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [promoPrice, setPromoPrice] = useState(
    initial?.promoPrice != null ? String(initial.promoPrice) : ""
  );
  const [isLaunch, setIsLaunch] = useState(initial?.isLaunch ?? false);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [colorsText, setColorsText] = useState(
    (initial?.colors ?? [])
      .map((c) => (c.hex ? `${c.name}|${c.hex}` : c.name))
      .join("\n")
  );
  const [sizesText, setSizesText] = useState((initial?.sizes ?? []).join(", "));
  const [images, setImages] = useState<{ url: string; colorName?: string | null }[]>(
    initial?.images ?? []
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded: { url: string }[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha no upload");
        uploaded.push({ url: data.url });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro upload");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const colors = colorsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [n, hex] = line.split("|").map((s) => s.trim());
        return { name: n, hex: hex || null };
      });

    const sizes = sizesText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      description,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      isLaunch,
      categoryId,
      colors,
      sizes,
      images: images.map((img, i) => ({
        url: img.url,
        sortOrder: i,
        colorName: img.colorName ?? null,
      })),
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      router.push("/admin/modelos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Nome do modelo"
        className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Descrição"
        className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
        <input
          type="number"
          step="0.01"
          value={promoPrice}
          onChange={(e) => setPromoPrice(e.target.value)}
          placeholder="Preço promocional"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
      </div>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        required
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isLaunch} onChange={(e) => setIsLaunch(e.target.checked)} />
        Lançamento
      </label>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Cores (uma por linha: Nome ou Nome|#hex)
        </p>
        <textarea
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          rows={3}
          placeholder={"Preto|#111111\nNude|#d4b5a0"}
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Numerações (separadas por vírgula)
        </p>
        <input
          value={sizesText}
          onChange={(e) => setSizesText(e.target.value)}
          placeholder="34, 35, 36, 37, 38, 39"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Imagens</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadFiles(e.target.files)}
          className="w-full text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={img.url} className="relative h-24 w-20 overflow-hidden bg-[var(--sand)]">
              <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                className="absolute right-1 top-1 bg-black/60 px-1 text-xs text-white"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <RoundedSlideButton type="submit" disabled={busy} className="w-full">
        {busy ? "Salvando..." : isEdit ? "Atualizar modelo" : "Criar modelo"}
      </RoundedSlideButton>
    </form>
  );
}
