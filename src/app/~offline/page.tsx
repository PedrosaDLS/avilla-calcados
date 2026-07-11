import Link from "next/link";

export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Sem conexão</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl">Você está offline</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Não foi possível carregar esta página. Verifique sua internet e tente novamente.
      </p>
      <Link
        href="/"
        className="mt-8 border border-[var(--line)] px-5 py-2 text-sm transition hover:border-[var(--ink)]"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
