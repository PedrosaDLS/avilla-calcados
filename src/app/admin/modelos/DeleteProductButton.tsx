"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    const label = name ? `“${name}”` : "este modelo";
    if (!confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      router.refresh();
    } catch {
      alert("Não foi possível excluir o modelo. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      aria-label={name ? `Excluir ${name}` : "Excluir modelo"}
      title="Excluir"
      aria-busy={busy}
      className="inline-flex min-h-11 min-w-11 items-center justify-center text-red-700 transition hover:bg-red-700/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-400/10 dark:focus-visible:outline-red-400"
    >
      <TrashIcon />
    </button>
  );
}
