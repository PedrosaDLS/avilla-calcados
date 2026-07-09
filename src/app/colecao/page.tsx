import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { ProductSearch } from "@/components/filters/ProductSearch";
import {
  buildProductWhere,
  getFilterOptions,
  parseFilters,
  productCardInclude,
} from "@/lib/products";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ColecaoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const where = buildProductWhere(filters);
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [total, products, filterOptions] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    getFilterOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
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
    <section className="relative isolate w-full px-4 py-6 md:px-6 md:py-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Catálogo</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl">
            Coleção
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {total} modelo{total === 1 ? "" : "s"} · página {page} de {totalPages}
          </p>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-5 lg:gap-6">
          <div className="w-full md:sticky md:top-24 md:-ml-2 md:w-56 md:flex-none lg:-ml-3 lg:w-60 xl:w-64">
            <Suspense fallback={null}>
              <ProductFilters {...filterOptions} />
            </Suspense>
          </div>
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted)] md:hidden">
                {total} modelo{total === 1 ? "" : "s"}
              </p>
              <Suspense fallback={null}>
                <ProductSearch key={filters.search ?? ""} initialValue={filters.search} />
              </Suspense>
            </div>
            <ProductGrid products={cards} />
            <div className="flex items-center justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
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
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
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
