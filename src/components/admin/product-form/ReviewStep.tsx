import { buildPreviewProduct, ProductPreview, ReviewSummary } from "./ProductPreview";
import type { Category, ProductFormState } from "./types";

type Props = {
  state: ProductFormState;
  categories: Category[];
};

export function ReviewStep({ state, categories }: Props) {
  const preview = buildPreviewProduct(state, categories);

  return (
    <div className="space-y-6">
      <ReviewSummary state={state} categories={categories} />
      <ProductPreview product={preview} />
      <p className="text-xs text-[var(--muted)]">
        Confira os dados antes de publicar. Você poderá editar depois na lista de modelos.
      </p>
    </div>
  );
}
