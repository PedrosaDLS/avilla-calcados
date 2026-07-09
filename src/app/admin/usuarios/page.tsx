import { prisma } from "@/lib/prisma";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium">Usuários cadastrados</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="border border-[var(--line)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-[var(--muted)]">{u.email}</p>
              </div>
              <div className="text-right text-sm">
                <p className={u.role === "ADMIN" ? "text-[var(--accent)]" : ""}>{u.role}</p>
                <p className="text-[var(--muted)]">
                  {u.createdAt.toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
