import type { ProductFormState } from "./types";

export type StepErrors = Record<string, string>;

export function validateBasicInfo(state: ProductFormState): StepErrors {
  const errors: StepErrors = {};
  const name = state.name.trim();
  const price = Number(state.price);
  const promo = state.promoPrice.trim() ? Number(state.promoPrice) : null;

  if (!name) errors.name = "Informe o nome do modelo.";
  if (!state.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = "Informe um preço válido maior que zero.";
  }
  if (state.promoPrice.trim()) {
    if (Number.isNaN(promo!) || promo! <= 0) {
      errors.promoPrice = "Preço promocional inválido.";
    } else if (!Number.isNaN(price) && promo! >= price) {
      errors.promoPrice = "Preço promocional deve ser menor que o preço normal.";
    }
  }
  if (!state.categoryId) errors.categoryId = "Selecione uma categoria.";

  return errors;
}

export function validateVariants(state: ProductFormState): StepErrors {
  const errors: StepErrors = {};
  const validColors = state.colors.filter((c) => c.name.trim());

  if (!validColors.length) {
    errors.colors = "Adicione pelo menos uma cor.";
  } else if (validColors.some((c) => !c.name.trim())) {
    errors.colors = "Todas as cores precisam de um nome.";
  }

  if (!state.sizes.length) {
    errors.sizes = "Selecione pelo menos uma numeração.";
  }

  return errors;
}

export function validateImages(state: ProductFormState): StepErrors {
  const errors: StepErrors = {};
  if (!state.images.length) {
    errors.images = "Informe pelo menos uma foto.";
  }
  const hasColors = state.colors.some((c) => c.name.trim());
  if (hasColors && state.images.some((img) => !img.colorName)) {
    errors.images =
      "Atribua uma cor a cada foto ou remova cores que não serão usadas.";
  }
  return errors;
}

export function validateAll(state: ProductFormState): StepErrors {
  return {
    ...validateBasicInfo(state),
    ...validateVariants(state),
    ...validateImages(state),
  };
}

export function getAllSizes(state: ProductFormState): string[] {
  return [...state.sizes].sort((a, b) => Number(a) - Number(b));
}

export function mapApiError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("unauthorized") || lower.includes("não autorizado")) {
    return "Sessão expirada. Faça login novamente.";
  }
  if (lower.includes("positive")) return "Preço deve ser maior que zero.";
  if (lower.includes("min")) return "Preencha todos os campos obrigatórios.";
  if (lower.includes("unexpected end of json")) {
    return "Falha no upload. Verifique o arquivo e tente novamente.";
  }
  return message || "Erro ao salvar. Tente novamente.";
}
