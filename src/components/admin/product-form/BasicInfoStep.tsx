import { Field, inputClass } from "./Field";
import type { Category, ProductFormState } from "./types";
import type { StepErrors } from "./validation";

type Props = {
  state: ProductFormState;
  categories: Category[];
  errors: StepErrors;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
};

export function BasicInfoStep({ state, categories, errors, onChange }: Props) {
  return (
    <div className="space-y-5">
      <Field
        id="product-name"
        label="Nome do modelo"
        hint="Nome que aparece na loja."
        error={errors.name}
      >
        <input
          id="product-name"
          value={state.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={inputClass}
          placeholder="Ex.: Sandália Anabela Nude"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="product-price" label="Preço" error={errors.price}>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
              R$
            </span>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={state.price}
              onChange={(e) => onChange("price", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="0,00"
            />
          </div>
        </Field>

        <Field
          id="product-promo"
          label="Preço promocional"
          optional
          hint="Use só se o modelo estiver em oferta."
          error={errors.promoPrice}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
              R$
            </span>
            <input
              id="product-promo"
              type="number"
              step="0.01"
              min="0"
              value={state.promoPrice}
              onChange={(e) => onChange("promoPrice", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="0,00"
            />
          </div>
        </Field>
      </div>

      <Field
        id="product-category"
        label="Categoria"
        error={errors.categoryId}
      >
        <select
          id="product-category"
          value={state.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={state.isLaunch}
            onChange={(e) => onChange("isLaunch", e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium">Lançamento</span>
            <span className="text-xs text-[var(--muted)]">
              Destaca o modelo na página inicial da loja.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
