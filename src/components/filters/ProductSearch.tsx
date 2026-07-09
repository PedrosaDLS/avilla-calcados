"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function ProductSearch({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);

  const applySearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = term.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
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
      applySearch(value);
    }, 350);

    return () => clearTimeout(timeout);
  }, [value, applySearch, searchParams]);

  const clear = () => {
    setValue("");
    applySearch("");
  };

  return (
    <div
      className={`relative w-full ${pending ? "opacity-70" : ""}`}
    >
      <label htmlFor="catalog-search" className="sr-only">
        Pesquisar modelos
      </label>
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Pesquisar modelos..."
        className="w-full rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] py-4 pl-5 pr-12 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
      />
      <div className="absolute inset-y-0 right-3 flex items-center">
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--sand)] hover:text-[var(--ink)]"
            aria-label="Limpar pesquisa"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3L11 11M11 3L3 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
