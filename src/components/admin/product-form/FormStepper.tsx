import { STEPS } from "./types";

type Props = {
  currentStep: number;
};

export function FormStepper({ currentStep }: Props) {
  return (
    <div className="mb-8">
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs tracking-wide transition ${
                active
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                  : done
                    ? "border-[var(--accent)] bg-[var(--sand)] text-[var(--ink)]"
                    : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  active
                    ? "bg-[var(--bg)] text-[var(--ink)]"
                    : done
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--sand)]"
                }`}
              >
                {done ? "✓" : step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Etapa {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.label}
      </p>
    </div>
  );
}
