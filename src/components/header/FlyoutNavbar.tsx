"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Início" },
  { href: "/colecao", label: "Coleção" },
];

function firstName(name?: string | null) {
  if (!name?.trim()) return "visitante";
  return name.trim().split(/\s+/)[0];
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserSessionActions({
  name,
  onLogout,
  className = "",
}: {
  name?: string | null;
  onLogout: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-[var(--ink)]">Olá, {firstName(name)}</span>
      <button
        type="button"
        onClick={onLogout}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--sand)] hover:text-[var(--ink)]"
        aria-label="Sair da conta"
      >
        <LogoutIcon />
      </button>
    </div>
  );
}

export function FlyoutNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [flyout, setFlyout] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-6">
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => setFlyout(link.href)}
              onMouseLeave={() => setFlyout(null)}
            >
              <Link
                href={link.href}
                className={`px-4 py-2 text-sm tracking-wide transition ${
                  pathname === link.href
                    ? "text-[var(--ink)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
              <AnimatePresence>
                {flyout === link.href && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full min-w-[180px] border border-[var(--line)] bg-[var(--bg-elevated)] p-3 shadow-lg"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {link.label}
                    </p>
                    <Link
                      href={link.href}
                      className="mt-2 block text-sm text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      Ver {link.label.toLowerCase()}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
        </div>

        <Link
          href="/"
          className="logo-brand absolute left-1/2 -translate-x-1/2 text-[var(--ink)]"
        >
          ávilla
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/carrinho" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            Carrinho
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              Admin
            </Link>
          )}
          {session ? (
            <UserSessionActions
              name={session.user?.name}
              onLogout={() => signOut({ callbackUrl: "/" })}
            />
          ) : (
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              Entrar
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label="Menu"
          className="ml-auto flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-[var(--ink)] transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[var(--ink)] transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[var(--ink)] transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--line)] bg-[var(--bg)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-base text-[var(--ink)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/carrinho" onClick={() => setOpen(false)} className="py-3 text-base">
                Carrinho
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setOpen(false)} className="py-3 text-base">
                  Admin
                </Link>
              )}
              {session ? (
                <UserSessionActions
                  name={session.user?.name}
                  className="py-3"
                  onLogout={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                />
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="py-3 text-base">
                  Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
