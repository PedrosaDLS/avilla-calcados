"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.4 14.5 9l6 .6-4.6 4 1.4 5.8L12 16.6 6.7 19.4l1.4-5.8-4.6-4 6-.6L12 3.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeatureProductButton({
  id,
  isLaunch,
  name,
}: {
  id: string;
  isLaunch: boolean;
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
        body: JSON.stringify({ isLaunch: !isLaunch }),
      });
      if (!res.ok) throw new Error("toggle failed");
      router.refresh();
    } catch {
      alert(
        isLaunch
          ? "Não foi possível remover o modelo dos destaques."
          : "Não foi possível marcar o modelo como destaque."
      );
    } finally {
      setBusy(false);
    }
  }

  const label = isLaunch
    ? name
      ? `Remover ${name} dos destaques`
      : "Remover dos destaques"
    : name
      ? `Marcar ${name} como destaque`
      : "Marcar como destaque";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      aria-pressed={isLaunch}
      aria-busy={busy}
      aria-label={label}
      title={isLaunch ? "Remover dos destaques" : "Marcar como destaque"}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center transition hover:bg-[var(--sand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 ${
        isLaunch ? "text-[var(--accent)]" : "text-[var(--ink)]"
      }`}
    >
      <StarIcon filled={isLaunch} />
    </button>
  );
}
