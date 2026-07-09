"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className="text-sm text-red-700 underline disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
