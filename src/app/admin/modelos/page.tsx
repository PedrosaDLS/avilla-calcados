import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CopyCategoryLinkBox } from "./CopyCategoryLinkBox";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { AdminModelosToolbar } from "./AdminModelosToolbar";
import { AdminModelosList } from "./AdminModelosList";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; destaque?: string }>;
};

function ToolbarFallback() {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center" aria-hidden>
      <div className="h-11 flex-1 border border-[var(--line)] bg-[var(--sand)]/50" />
      <div className="h-11 w-full border border-[var(--line)] bg-[var(--sand)]/50 sm:w-44" />
      <div className="h-11 w-full border border-[var(--line)] bg-[var(--sand)]/50 sm:w-48" />
    </div>
  );
}

export default async function AdminModelosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sort = sp.sort === "views" ? "views" : "recent";
  const onlyDestaque = sp.destaque === "1";
  const pageRaw = Number(sp.page) || 1;
  const page = Math.max(1, pageRaw);

  const where = {
    ...(onlyDestaque ? { isLaunch: true } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { category: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [total, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const productsRaw = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: sort === "views" ? { viewCount: "desc" } : { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    material: p.material,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
    isLaunch: p.isLaunch,
    isHidden: p.isHidden,
    viewCount: p.viewCount,
    category: { name: p.category.name },
    images: p.images.map((img) => ({ id: img.id, url: img.url })),
  }));

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (sort === "views") qs.set("sort", "views");
  if (onlyDestaque) qs.set("destaque", "1");

  const pageHref = (p: number) => {
    const params = new URLSearchParams(qs);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/modelos?${s}` : "/admin/modelos";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-[var(--ink)]">Modelos</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {total} {total === 1 ? "modelo" : "modelos"}
            {q || onlyDestaque ? " encontrados" : ""}
            {total > 0 ? ` · página ${currentPage} de ${totalPages}` : ""}
          </p>
        </div>
        <RoundedSlideButton href="/admin/modelos/novo" className="!min-h-11 !px-5 !py-2.5">
          Novo
        </RoundedSlideButton>
      </div>

      <Suspense fallback={<ToolbarFallback />}>
        <AdminModelosToolbar
          initialQuery={q}
          initialSort={sort}
          initialFilter={onlyDestaque ? "destaque" : "all"}
        />
      </Suspense>

      <CopyCategoryLinkBox categories={categories} />

      {products.length ? (
        <>
          <AdminModelosList products={products} />

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  className="border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm transition hover:border-[var(--ink)]"
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
                  className="border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm transition hover:border-[var(--ink)]"
                >
                  Próxima
                </Link>
              ) : (
                <span className="border border-transparent px-4 py-2 text-sm text-[var(--muted)]">
                  Próxima
                </span>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <div className="border border-dashed border-[var(--line)] px-6 py-14 text-center">
          <p className="text-[var(--ink)]">
            {q
              ? "Nenhum modelo encontrado."
              : onlyDestaque
                ? "Nenhum modelo em destaque."
                : "Nenhum modelo ainda."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
            {q
              ? "Tente outro termo ou limpe a pesquisa."
              : onlyDestaque
                ? "Marque a estrela na lista para um modelo aparecer aqui."
                : "Cadastre o primeiro modelo para ele aparecer na coleção."}
          </p>
          {!q && !onlyDestaque ? (
            <div className="mt-6 flex justify-center">
              <RoundedSlideButton href="/admin/modelos/novo" className="!min-h-11 !px-5 !py-2.5">
                Adicionar modelo
              </RoundedSlideButton>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
