import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatBRL, effectivePrice } from "@/lib/utils";
import { DeleteProductButton } from "./DeleteProductButton";
import { HideProductButton } from "./HideProductButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { AdminModelosToolbar } from "./AdminModelosToolbar";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
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

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: sort === "views" ? { viewCount: "desc" } : { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-[var(--ink)]">Modelos</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {products.length} {products.length === 1 ? "modelo" : "modelos"}
            {q ? " encontrados" : ""}
          </p>
        </div>
        <RoundedSlideButton href="/admin/modelos/novo" className="!min-h-11 !px-5 !py-2.5">
          Novo
        </RoundedSlideButton>
      </div>

      <Suspense fallback={<ToolbarFallback />}>
        <AdminModelosToolbar key={`${q}-${sort}`} initialQuery={q} initialSort={sort} />
      </Suspense>

      {categories.length ? (
        <div className="mb-6">
          <p className="mb-2 text-sm text-[var(--muted)]">Copiar link da coleção por categoria</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CopyLinkButton
                key={c.id}
                variant="chip"
                label={c.name}
                path={`/colecao?categoria=${encodeURIComponent(c.slug)}`}
                title={`Copiar link da coleção filtrada por ${c.name}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {products.length ? (
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
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
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
