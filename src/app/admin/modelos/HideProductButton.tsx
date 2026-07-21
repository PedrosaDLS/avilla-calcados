"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HideProductButton({
  id,
  isHidden,
}: {
  id: string;
  isHidden: boolean;
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

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      aria-pressed={isHidden}
      aria-busy={busy}
      title={isHidden ? "Mostrar no catálogo" : "Ocultar do catálogo"}
      className="inline-flex min-h-11 items-center px-2.5 text-sm text-[var(--ink)] underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
    >
      {busy ? "…" : isHidden ? "Mostrar" : "Ocultar"}
    </button>
  );
}
