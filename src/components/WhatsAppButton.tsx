"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ORDER_OPENING,
  buildWhatsAppUrl,
  messageForCart,
  messageForProduct,
  type WhatsAppItem,
} from "@/lib/whatsapp";

export function WhatsAppButton({
  item,
  items,
  className = "",
  label = "Pedir no WhatsApp",
}: {
  item?: WhatsAppItem;
  items?: WhatsAppItem[];
  className?: string;
  label?: string;
}) {
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const isCart = Boolean(items?.length);

  if (!isCart) {
    const text = item ? messageForProduct(item, origin) : "";
    const href = buildWhatsAppUrl(text);

    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:brightness-95 ${className}`}
      >
        {label}
      </Link>
    );
  }

  async function openCartWhatsApp() {
    if (!items?.length || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cart/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            material: i.material,
            qty: i.qty,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string };
      const text = data.url
        ? `${ORDER_OPENING} ${data.url}`
        : messageForCart(items, origin);
      window.open(buildWhatsAppUrl(text), "_blank", "noopener,noreferrer");
    } catch {
      window.open(
        buildWhatsAppUrl(messageForCart(items, origin)),
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={openCartWhatsApp}
      className={`inline-flex items-center justify-center bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-70 ${className}`}
    >
      {busy ? "Preparando…" : label}
    </button>
  );
}
