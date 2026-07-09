import { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export function Field({ id, label, hint, error, optional, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--ink)]">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[var(--muted)]">(opcional)</span>
        )}
      </label>
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20";
