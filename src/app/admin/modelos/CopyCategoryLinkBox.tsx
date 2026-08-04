"use client";

import { useMemo, useState } from "react";
import { CopyLinkButton } from "./CopyLinkButton";

type Category = { id: string; name: string; slug: string };

const controlClass =
  "h-11 w-full border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] outline-none transition-[border-color] duration-150 focus-visible:border-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function CopyCategoryLinkBox({ categories }: { categories: Category[] }) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");

  const selected = useMemo(
    () => categories.find((c) => c.id === selectedId) ?? categories[0] ?? null,
    [categories, selectedId]
  );

  if (!categories.length || !selected) return null;

  return (
    <div className="mb-6 border border-[var(--line)] bg-[var(--bg-elevated)] p-3 sm:p-4">
      <p className="mb-3 text-sm text-[var(--muted)]">Copiar link da coleção por categoria</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Categoria</span>
          <select
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className={controlClass}
            aria-label="Selecionar categoria para copiar o link"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <CopyLinkButton
          key={selected.id}
          variant="chip"
          label={`Copiar ${selected.name}`}
          path={`/colecao?categoria=${encodeURIComponent(selected.slug)}`}
          title={`Copiar link da coleção filtrada por ${selected.name}`}
        />
      </div>
    </div>
  );
}
