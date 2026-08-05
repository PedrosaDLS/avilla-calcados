import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/modelos", label: "Modelos" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-5xl px-4 pb-10 pt-6 md:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Admin</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">Àvilla</h1>
        </div>
        <Link href="/" className="text-sm text-[var(--muted)] underline">
          Ver loja
        </Link>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border border-[var(--line)] px-4 py-2 text-sm hover:border-[var(--ink)]"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
