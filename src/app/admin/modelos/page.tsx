import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatBRL, effectivePrice } from "@/lib/utils";
import { DeleteProductButton } from "./DeleteProductButton";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { AdminModelosToolbar } from "./AdminModelosToolbar";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function AdminModelosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sort = sp.sort === "views" ? "views" : "recent";

  const products = await prisma.product.findMany({
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
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium">Modelos</h2>
        <RoundedSlideButton href="/admin/modelos/novo" className="!px-4 !py-2">
          Novo
        </RoundedSlideButton>
      </div>

      <Suspense fallback={null}>
        <AdminModelosToolbar key={`${q}-${sort}`} initialQuery={q} initialSort={sort} />
      </Suspense>

      <ul className="space-y-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 border border-[var(--line)] p-3"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[var(--sand)]">
              {p.images[0] && (
                <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="48px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {p.category.name} · {formatBRL(effectivePrice(p.price, p.promoPrice))} · {p.viewCount} views
              </p>
            </div>
            <Link href={`/admin/modelos/${p.id}`} className="text-sm underline">
              Editar
            </Link>
            <DeleteProductButton id={p.id} />
          </li>
        ))}
        {!products.length && (
          <p className="py-10 text-center text-[var(--muted)]">
            {q ? "Nenhum modelo encontrado." : "Nenhum modelo ainda."}
          </p>
        )}
      </ul>
    </div>
  );
}
