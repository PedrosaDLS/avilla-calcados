import { Field, inputClass } from "./Field";
import type { ColorEntry, ProductFormState } from "./types";
import { DEFAULT_SIZES } from "./types";
import type { StepErrors } from "./validation";

type Props = {
  state: ProductFormState;
  errors: StepErrors;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
};

export function VariantsStep({ state, errors, onChange }: Props) {
  function updateColor(index: number, patch: Partial<ColorEntry>) {
    const next = state.colors.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange("colors", next);
  }

  function addColor() {
    onChange("colors", [...state.colors, { name: "", hex: "#d4b5a0" }]);
  }

  function removeColor(index: number) {
    onChange(
      "colors",
      state.colors.filter((_, i) => i !== index)
    );
  }

  function toggleSize(size: string) {
    const next = state.sizes.includes(size)
      ? state.sizes.filter((s) => s !== size)
      : [...state.sizes, size];
    onChange("sizes", next);
  }

  const selectedCount = state.sizes.length;

  return (
    <div className="space-y-6">
      <div>
        <Field
          id="product-colors"
          label="Cores"
          hint="Adicione cada cor disponível. A amostra ajuda na vitrine."
          error={errors.colors}
        >
          <div className="space-y-3">
            {state.colors.map((color, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3"
              >
                <input
                  type="color"
                  value={color.hex || "#cccccc"}
                  onChange={(e) => updateColor(index, { hex: e.target.value })}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-[var(--line)]"
                  aria-label={`Cor ${index + 1}`}
                />
                <input
                  value={color.name}
                  onChange={(e) => updateColor(index, { name: e.target.value })}
                  placeholder="Nome da cor (ex.: Nude)"
                  className={`${inputClass} min-w-[10rem] flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] hover:border-red-300 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addColor}
              className="w-full rounded-xl border border-dashed border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              + Adicionar cor
            </button>
          </div>
        </Field>
      </div>

      <div>
        <Field
          id="product-sizes"
          label="Numerações"
          hint="Toque para selecionar os tamanhos disponíveis."
          error={errors.sizes}
        >
          <p className="mb-3 text-xs text-[var(--muted)]">
            {selectedCount} tamanho{selectedCount === 1 ? "" : "s"} selecionado
            {selectedCount === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SIZES.map((size) => {
              const active = state.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`min-w-11 rounded-full border px-3 py-2 text-sm transition ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)] hover:border-[var(--accent)]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}
