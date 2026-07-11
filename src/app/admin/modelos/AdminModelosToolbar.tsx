"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

type SortKey = "recent" | "views";

export function AdminModelosToolbar({
  initialQuery = "",
  initialSort = "recent",
}: {
  initialQuery?: string;
  initialSort?: SortKey;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>(initialSort);

  const pushParams = useCallback(
    (nextQuery: string, nextSort: SortKey) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = nextQuery.trim();

      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      if (nextSort === "views") params.set("sort", "views");
      else params.delete("sort");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (value.trim() === current.trim()) return;
      pushParams(value, sort);
    }, 350);

    return () => clearTimeout(timeout);
  }, [value, sort, pushParams, searchParams]);

  const onSortChange = (nextSort: SortKey) => {
    setSort(nextSort);
    pushParams(value, nextSort);
  };

  const clear = () => {
    setValue("");
    pushParams("", sort);
  };

  return (
    <div className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center ${pending ? "opacity-70" : ""}`}>
      <div className="relative min-w-0 flex-1">
        <label htmlFor="admin-modelos-search" className="sr-only">
          Pesquisar modelos
        </label>
        <input
          id="admin-modelos-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pesquisar modelos..."
          className="w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--ink)]"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute inset-y-0 right-2 px-1 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label="Limpar pesquisa"
          >
            ✕
          </button>
        ) : null}
      </div>

      <label className="flex shrink-0 items-center gap-2 text-sm text-[var(--muted)]">
        <span className="whitespace-nowrap">Ordenar</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
        >
          <option value="recent">Último adicionado</option>
          <option value="views">Mais vistos</option>
        </select>
      </label>
    </div>
  );
}
