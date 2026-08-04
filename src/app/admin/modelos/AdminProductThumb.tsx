"use client";

import Image from "next/image";
import { useState } from "react";

export function AdminProductThumb({
  src,
  alt,
}: {
  src: string | null | undefined;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim() || null;
  const isLocalUpload = Boolean(url?.startsWith("/uploads/"));

  return (
    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-[var(--sand)] ring-1 ring-[var(--line)]">
      {url && !failed ? (
        <Image
          src={url}
          alt={alt}
          fill
          unoptimized={isLocalUpload}
          className="object-cover"
          sizes="48px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted)]" aria-hidden>
          —
        </span>
      )}
    </div>
  );
}
