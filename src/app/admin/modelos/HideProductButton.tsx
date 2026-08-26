"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.2A9.6 9.6 0 0 1 12 6c6 0 9.5 7 9.5 7a16.4 16.4 0 0 1-3.3 3.9M6.4 6.4C4 8.1 2.5 12 2.5 12S6 19 12 19c1.4 0 2.7-.3 3.8-.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HideProductButton({
  id,
  isHidden,
  name,
}: {
  id: string;
  isHidden: boolean;
  name?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onToggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !isHidden }),
      });
      if (!res.ok) throw new Error("toggle failed");
      router.refresh();
    } catch {
      alert(
        isHidden
          ? "Não foi possível mostrar o modelo no catálogo."
          : "Não foi possível ocultar o modelo do catálogo."
      );
    } finally {
      setBusy(false);
    }
  }

  const label = isHidden
    ? name
      ? `Mostrar ${name} no catálogo`
      : "Mostrar no catálogo"
    : name
      ? `Ocultar ${name} do catálogo`
      : "Ocultar do catálogo";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      aria-pressed={isHidden}
      aria-busy={busy}
      aria-label={label}
      title={isHidden ? "Mostrar no catálogo" : "Ocultar do catálogo"}
      className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--ink)] transition hover:bg-[var(--sand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
    >
      {isHidden ? <EyeIcon /> : <EyeOffIcon />}
    </button>
  );
}
