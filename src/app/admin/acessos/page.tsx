import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminAcessosPage() {
  const products = await prisma.product.findMany({
    orderBy: { viewCount: "desc" },
    take: 50,
    include: { category: true },
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium">Modelos mais acessados</h2>
      <ol className="space-y-2">
        {products.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-3 border border-[var(--line)] px-4 py-3"
          >
            <span className="w-8 text-sm text-[var(--muted)]">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <Link href={`/modelo/${p.slug}`} className="font-medium">
                {p.name}
              </Link>
              <p className="text-xs text-[var(--muted)]">{p.category.name}</p>
            </div>
            <span className="text-sm">{p.viewCount} views</span>
          </li>
        ))}
        {!products.length && (
          <p className="py-10 text-center text-[var(--muted)]">Sem dados ainda.</p>
        )}
      </ol>
    </div>
  );
}
