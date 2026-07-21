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

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Excluir este modelo?")) return;
    setBusy(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      aria-label="Excluir"
      title="Excluir"
      className="inline-flex h-9 w-9 items-center justify-center text-red-600 transition hover:bg-red-600/10 disabled:opacity-50"
    >
      <TrashIcon />
    </button>
  );
}
