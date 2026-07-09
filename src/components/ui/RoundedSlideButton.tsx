"use client";

import Link from "next/link";
import { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  variant?: "primary" | "sand";
  className?: string;
};

export function RoundedSlideButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  className = "",
}: Props) {
  const base =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full border px-7 py-3.5 text-sm tracking-wide transition disabled:opacity-60";

  const style: CSSProperties =
    variant === "sand"
      ? {
          borderColor: "var(--line)",
          backgroundColor: "var(--sand)",
          color: "var(--ink)",
        }
      : {
          borderColor: "var(--ink)",
          backgroundColor: "var(--ink)",
          color: "var(--bg)",
        };

  const slide =
    variant === "sand" ? "bg-[var(--ink)]" : "bg-[var(--accent)]";

  const hoverLabel =
    variant === "sand" ? "group-hover:!text-[var(--bg)]" : "group-hover:!text-[var(--bg)]";

  const inner = (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 translate-y-[105%] rounded-full transition-transform duration-300 ease-out group-hover:translate-y-0 ${slide}`}
      />
      <span className={`relative z-10 transition-colors duration-300 ${hoverLabel}`}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${className}`}
      style={style}
    >
      {inner}
    </button>
  );
}
