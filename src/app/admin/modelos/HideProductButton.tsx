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
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !isHidden }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      className="text-sm underline disabled:opacity-50"
    >
      {isHidden ? "Mostrar" : "Ocultar"}
    </button>
  );
}
