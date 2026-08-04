import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatBRL, effectivePrice } from "@/lib/utils";
import { DeleteProductButton } from "./DeleteProductButton";
import { HideProductButton } from "./HideProductButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { CopyCategoryLinkBox } from "./CopyCategoryLinkBox";
import { AdminProductThumb } from "./AdminProductThumb";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { AdminModelosToolbar } from "./AdminModelosToolbar";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

function ToolbarFallback() {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center" aria-hidden>
      <div className="h-11 flex-1 border border-[var(--line)] bg-[var(--sand)]/50" />
      <div className="h-11 w-full border border-[var(--line)] bg-[var(--sand)]/50 sm:w-48" />
    </div>
  );
}

export default async function AdminModelosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sort = sp.sort === "views" ? "views" : "recent";
  const pageRaw = Number(sp.page) || 1;
  const page = Math.max(1, pageRaw);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { category: { name: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const [total, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: sort === "views" ? { viewCount: "desc" } : { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (sort === "views") qs.set("sort", "views");

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
            {q ? " encontrados" : ""}
            {total > 0 ? ` · página ${currentPage} de ${totalPages}` : ""}
          </p>
        </div>
        <RoundedSlideButton href="/admin/modelos/novo" className="!min-h-11 !px-5 !py-2.5">
          Novo
        </RoundedSlideButton>
      </div>

      <Suspense fallback={<ToolbarFallback />}>
        <AdminModelosToolbar key={`${q}-${sort}`} initialQuery={q} initialSort={sort} />
      </Suspense>

      <CopyCategoryLinkBox categories={categories} />

      {products.length ? (
        <>
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className={`border border-[var(--line)] bg-[var(--bg-elevated)] p-3 transition-[border-color,background-color] duration-200 sm:p-4 ${
                  p.isHidden ? "border-dashed bg-[var(--sand)]/35" : ""
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <AdminProductThumb src={p.images[0]?.url} alt={p.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate font-medium text-[var(--ink)]">{p.name}</p>
                        {p.isHidden ? (
                          <span className="inline-flex shrink-0 bg-[var(--sand)] px-1.5 py-0.5 text-[11px] tracking-wide text-[var(--muted)]">
                            Oculto no catálogo
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {p.category.name} · {formatBRL(effectivePrice(p.price, p.promoPrice))}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {p.viewCount} {p.viewCount === 1 ? "visualização" : "visualizações"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-1 border-t border-[var(--line)] pt-3 sm:border-0 sm:pt-0">
                    <Link
                      href={`/admin/modelos/${p.id}`}
                      className="inline-flex min-h-11 items-center px-2.5 text-sm text-[var(--ink)] underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      Editar
                    </Link>
                    <HideProductButton id={p.id} isHidden={p.isHidden} />
                    <CopyLinkButton
                      path={`/modelo/${p.slug}`}
                      title={`Copiar link da página de ${p.name}`}
                    />
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

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
            {q ? "Nenhum modelo encontrado." : "Nenhum modelo ainda."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
            {q
              ? "Tente outro termo ou limpe a pesquisa."
              : "Cadastre o primeiro modelo para ele aparecer na coleção."}
          </p>
          {!q ? (
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
