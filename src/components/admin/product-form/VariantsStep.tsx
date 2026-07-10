import { Field, inputClass } from "./Field";
import type { ColorEntry, ProductFormState } from "./types";
import { DEFAULT_SIZES, normalizeColorName, PRESET_COLORS } from "./types";
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

  function addColor(entry?: ColorEntry) {
    onChange("colors", [
      ...state.colors,
      entry ?? { name: "", hex: "#d4b5a0", sizes: [] },
    ]);
  }

  function removeColor(index: number) {
    onChange(
      "colors",
      state.colors.filter((_, i) => i !== index)
    );
  }

  function toggleColorSize(index: number, size: string) {
    const color = state.colors[index];
    if (!color) return;
    const nextSizes = color.sizes.includes(size)
      ? color.sizes.filter((s) => s !== size)
      : [...color.sizes, size];
    updateColor(index, { sizes: nextSizes });
  }

  function addPreset(preset: ColorEntry) {
    const exists = state.colors.some(
      (c) => normalizeColorName(c.name) === normalizeColorName(preset.name)
    );
    if (exists) return;
    addColor({ ...preset, sizes: [] });
  }

  return (
    <div className="space-y-6">
      <div>
        <Field
          id="product-colors"
          label="Cores rápidas"
          hint="Opcional. Toque para adicionar cores comuns ao catálogo."
        >
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => addPreset(preset)}
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs transition hover:border-[var(--accent)]"
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ background: preset.hex || "#ccc" }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div>
        <Field
          id="product-colors"
          label="Cores e numerações"
          hint="Opcional. Para cada cor, selecione os tamanhos disponíveis."
          error={errors.colors}
        >
          <div className="space-y-4">
            {state.colors.map((color, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
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

                <div className="mt-4">
                  <p className="mb-2 text-xs text-[var(--muted)]">
                    {color.sizes.length} tamanho{color.sizes.length === 1 ? "" : "s"} nesta cor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_SIZES.map((size) => {
                      const active = color.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleColorSize(index, size)}
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
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addColor()}
              className="w-full rounded-xl border border-dashed border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              + Adicionar cor
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}
