import type { FormTab } from "./types";
import { FORM_TABS } from "./types";

type Props = {
  activeTab: FormTab;
  onTabChange: (tab: FormTab) => void;
};

export function FormTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="mb-8 flex gap-2 border-b border-[var(--line)]">
      {FORM_TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm transition ${
              active
                ? "border-[var(--ink)] font-medium text-[var(--ink)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
