"use client";

import Link from "next/link";
import {
  buildWhatsAppUrl,
  messageForCart,
  messageForProduct,
  type WhatsAppItem,
} from "@/lib/whatsapp";

export function WhatsAppButton({
  item,
  items,
  total,
  className = "",
  label = "Pedir no WhatsApp",
}: {
  item?: WhatsAppItem;
  items?: WhatsAppItem[];
  total?: number;
  className?: string;
  label?: string;
}) {
  const text = items
    ? messageForCart(items, total)
    : item
      ? messageForProduct(item)
      : "";
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
