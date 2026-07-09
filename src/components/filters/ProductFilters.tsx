"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FilterSection } from "@/components/filters/FilterSection";

type Category = { id: string; name: string; slug: string };
type ColorOpt = { name: string; hex: string | null };

type Props = {
  categories: Category[];
  colors: ColorOpt[];
  sizes: string[];
  priceRange: { min: number; max: number };
};

function FilterChip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] shadow-sm"
          : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--sand)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function ProductFilters({ categories, colors, sizes, priceRange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedColors = (searchParams.get("cor") ?? "").split(",").filter(Boolean);
  const selectedSizes = (searchParams.get("tamanho") ?? "").split(",").filter(Boolean);
  const selectedCats = (searchParams.get("categoria") ?? "").split(",").filter(Boolean);
  const minPrice = searchParams.get("minPrice") ?? String(Math.floor(priceRange.min));
  const maxPrice = searchParams.get("maxPrice") ?? String(Math.ceil(priceRange.max));

  const activeCount = useMemo(
    () =>
      selectedCats.length +
      selectedColors.length +
      selectedSizes.length +
      (searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0),
    [selectedCats, selectedColors, selectedSizes, searchParams]
  );

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
      if (key !== "page") params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const toggleList = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update(key, next.length ? next.join(",") : null);
  };

  const clearFilters = () => {
    startTransition(() => router.push(pathname));
  };

  const body = (
    <div className={`space-y-3 ${pending ? "opacity-70" : ""}`}>
      <FilterSection title="Categorias" count={selectedCats.length} defaultOpen={false}>
        <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={selectedCats.includes(c.slug)}
              onClick={() => toggleList("categoria", selectedCats, c.slug)}
              className="flex w-full justify-start text-left"
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Faixa de preço" count={searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0}>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            aria-label="Preço mínimo"
            defaultValue={minPrice}
            placeholder="Mínimo"
            className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            onBlur={(e) => update("minPrice", e.target.value || null)}
          />
          <input
            type="number"
            aria-label="Preço máximo"
            defaultValue={maxPrice}
            placeholder="Máximo"
            className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            onBlur={(e) => update("maxPrice", e.target.value || null)}
          />
        </div>
      </FilterSection>

      {colors.length > 0 && (
        <FilterSection title="Cores" count={selectedColors.length} defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <FilterChip
                key={c.name}
                active={selectedColors.includes(c.name)}
                onClick={() => toggleList("cor", selectedColors, c.name)}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ background: c.hex || "#ccc" }}
                  />
                  {c.name}
                </span>
              </FilterChip>
            ))}
          </div>
        </FilterSection>
      )}

      {sizes.length > 0 && (
        <FilterSection title="Tamanhos" count={selectedSizes.length} defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <FilterChip
                key={s}
                active={selectedSizes.includes(s)}
                onClick={() => toggleList("tamanho", selectedSizes, s)}
                className="min-w-11 px-3"
              >
                {s}
              </FilterChip>
            ))}
          </div>
        </FilterSection>
      )}

      <button
        type="button"
        onClick={clearFilters}
        disabled={activeCount === 0}
        className="w-full rounded-full border border-[var(--line)] bg-[var(--sand)] px-4 py-3 text-sm font-medium tracking-normal text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--sand-hover)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Limpar filtros
      </button>
    </div>
  );

  return (
    <>
      <aside className="max-md:hidden w-full">
        <div className="mb-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-4">
          <p className="text-base font-medium tracking-normal text-[var(--ink)]">Filtros</p>
          {activeCount > 0 && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {activeCount} filtro{activeCount === 1 ? "" : "s"} selecionado{activeCount === 1 ? "" : "s"}
            </p>
          )}
          {activeCount === 0 && (
            <p className="mt-1 text-xs text-[var(--muted)]">Refine sua busca por categoria, preço ou tamanho.</p>
          )}
        </div>
        {body}
      </aside>

      <div className="mb-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-3.5 text-sm font-medium tracking-wide shadow-sm"
        >
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-xs text-[var(--bg)]">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-[var(--bg)] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Filtros</h2>
                  {activeCount > 0 && (
                    <p className="text-sm text-[var(--muted)]">{activeCount} ativos</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
                >
                  Fechar
                </button>
              </div>
              {body}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
