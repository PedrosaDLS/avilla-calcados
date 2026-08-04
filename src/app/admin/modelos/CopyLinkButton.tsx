"use client";

import { useState } from "react";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveAbsoluteUrl(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${clean}`;
  }
  const env =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return env ? `${env}${clean}` : clean;
}

export function CopyLinkButton({
  path,
  label,
  title,
  variant = "icon",
}: {
  path: string;
  label?: string;
  title?: string;
  variant?: "icon" | "chip";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const url = resolveAbsoluteUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Não foi possível copiar o link. Tente de novo.");
    }
  }

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onCopy}
        title={title ?? (copied ? "Copiado" : "Copiar link")}
        aria-label={title ?? (copied ? "Link copiado" : `Copiar link de ${label ?? "categoria"}`)}
        className="inline-flex min-h-9 items-center gap-1.5 border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--ink)] transition hover:border-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <span className="max-w-[10rem] truncate">{copied ? "Copiado" : label}</span>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={title ?? (copied ? "Copiado" : "Copiar link da página")}
      aria-label={title ?? (copied ? "Link copiado" : "Copiar link da página do modelo")}
      className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--ink)] transition hover:bg-[var(--sand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
