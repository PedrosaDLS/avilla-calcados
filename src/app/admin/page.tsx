import { prisma } from "@/lib/prisma";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

export default async function AdminHomePage() {
  const [products, users, top] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.product.findFirst({ orderBy: { viewCount: "desc" }, select: { name: true, viewCount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-[var(--line)] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Modelos</p>
          <p className="mt-2 text-3xl">{products}</p>
        </div>
        <div className="border border-[var(--line)] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Usuários</p>
          <p className="mt-2 text-3xl">{users}</p>
        </div>
        <div className="border border-[var(--line)] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Top acesso</p>
          <p className="mt-2 text-lg">{top?.name ?? "—"}</p>
          <p className="text-sm text-[var(--muted)]">{top?.viewCount ?? 0} views</p>
        </div>
      </div>
      <RoundedSlideButton href="/admin/modelos/novo">Adicionar modelo</RoundedSlideButton>
    </div>
  );
}
