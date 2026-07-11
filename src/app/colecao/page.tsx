import Link from "next/link";
import { Suspense } from "react";
import { getCollectionPageData, getFilterOptions } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { ProductSearch } from "@/components/filters/ProductSearch";
import { parseFilters } from "@/lib/products";

export const revalidate = 60;

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ColecaoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [collection, filterOptions] = await Promise.all([
    getCollectionPageData(filters, page, PAGE_SIZE),
    getFilterOptions(),
  ]);

  const { total, totalPages, page: currentPage, products } = collection;
  const cards = products.map((p) => ({
    ...p,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
  }));

  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (k === "page" || v == null) return;
    qs.set(k, Array.isArray(v) ? v.join(",") : v);
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams(qs);
    params.set("page", String(p));
    return `/colecao?${params.toString()}`;
  };

  return (
    <section className="relative isolate w-full px-3 py-5 md:px-4 md:py-6 lg:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-4 md:mb-3 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Catálogo</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl">
              Coleção
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {total} modelo{total === 1 ? "" : "s"} · página {currentPage} de {totalPages}
            </p>
          </div>
          <div className="w-full md:max-w-md md:shrink-0">
            <Suspense fallback={null}>
              <ProductSearch key={filters.search ?? ""} initialValue={filters.search} />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4 lg:gap-5">
          <div className="w-full md:sticky md:top-24 md:-ml-3 md:w-52 md:flex-none lg:-ml-6 lg:w-56 xl:-ml-8 xl:w-60">
            <Suspense fallback={null}>
              <ProductFilters {...filterOptions} />
            </Suspense>
          </div>
          <div className="min-w-0 flex-1">
            <ProductGrid products={cards} />
            <div className="mt-5 flex items-center justify-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm transition hover:border-[var(--accent)] hover:bg-[var(--sand)]"
                >
                  Anterior
                </Link>
              ) : (
                <span className="border border-transparent px-4 py-2 text-sm text-[var(--muted)]">
                  Anterior
                </span>
              )}
              <span className="text-sm text-[var(--muted)]">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={pageHref(currentPage + 1)}
                  className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm transition hover:border-[var(--accent)] hover:bg-[var(--sand)]"
                >
                  Próxima
                </Link>
              ) : (
                <span className="border border-transparent px-4 py-2 text-sm text-[var(--muted)]">
                  Próxima
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
