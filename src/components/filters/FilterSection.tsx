"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useId, useState } from "react";

type Props = {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function FilterSection({ title, count = 0, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[0_4px_16px_rgba(28,23,20,0.03)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left transition hover:bg-[var(--sand)]/60"
      >
        <span className="text-sm font-medium tracking-normal text-[var(--ink)]">
          {title}
        </span>
        <span className="flex items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-[var(--sand)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink)]">
              {count}
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--muted)]"
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 5.5L7 9.5L11 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--line)] px-4 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
