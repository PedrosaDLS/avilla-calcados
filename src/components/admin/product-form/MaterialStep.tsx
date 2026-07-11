import { Field, inputClass } from "./Field";
import { PRESET_MATERIALS, type ProductFormState } from "./types";
import type { StepErrors } from "./validation";

type Props = {
  state: ProductFormState;
  errors: StepErrors;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
};

export function MaterialStep({ state, errors, onChange }: Props) {
  function selectPreset(material: string) {
    onChange("materialType", "preset");
    onChange("materialPreset", material);
    onChange("materialCustom", "");
  }

  function selectCustom() {
    onChange("materialType", "custom");
    onChange("materialPreset", "");
  }

  return (
    <div className="space-y-4">
      <Field
        id="product-material"
        label="Material"
        hint="Opcional. Selecione um material padrão ou informe um personalizado."
        error={errors.material}
      >
        <div className="flex flex-wrap gap-2">
          {PRESET_MATERIALS.map((material) => {
            const active =
              state.materialType === "preset" && state.materialPreset === material;
            return (
              <button
                key={material}
                type="button"
                onClick={() => selectPreset(material)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--line)] hover:border-[var(--accent)]"
                }`}
              >
                {material}
              </button>
            );
          })}
          <button
            type="button"
            onClick={selectCustom}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              state.materialType === "custom"
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                : "border-[var(--line)] hover:border-[var(--accent)]"
            }`}
          >
            Personalizado
          </button>
        </div>
      </Field>

      {state.materialType === "custom" && (
        <input
          id="product-material-custom"
          value={state.materialCustom}
          onChange={(e) => onChange("materialCustom", e.target.value)}
          placeholder="Ex.: Verniz, Lona..."
          className={inputClass}
        />
      )}
    </div>
  );
}
