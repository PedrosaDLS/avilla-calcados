"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

type SortKey = "recent" | "views";

const controlClass =
  "h-11 w-full border border-[var(--line)] bg-[var(--bg)] px-3 text-sm text-[var(--ink)] outline-none transition-[border-color] duration-150 placeholder:text-[var(--muted)] focus-visible:border-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

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

      // Search/sort always returns to first page.
      params.delete("page");

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
    <div
      className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center ${pending ? "opacity-70" : ""}`}
      aria-busy={pending}
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor="admin-modelos-search" className="sr-only">
          Pesquisar modelos
        </label>
        <input
          id="admin-modelos-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pesquisar por nome ou categoria…"
          className={`${controlClass} pr-11`}
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label="Limpar pesquisa"
          >
            ✕
          </button>
        ) : null}
      </div>

      <label className="flex w-full shrink-0 flex-col gap-1.5 text-sm text-[var(--muted)] sm:w-auto sm:flex-row sm:items-center sm:gap-2">
        <span className="whitespace-nowrap">Ordenar</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className={`${controlClass} sm:w-52`}
          aria-label="Ordenar modelos"
        >
          <option value="recent">Último adicionado</option>
          <option value="views">Mais vistos</option>
        </select>
      </label>
    </div>
  );
}
