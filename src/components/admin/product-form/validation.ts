import type { ProductFormState } from "./types";
import { resolveMaterial } from "./types";

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

export function validateMaterial(state: ProductFormState): StepErrors {
  const errors: StepErrors = {};
  if (state.materialType === "custom" && !state.materialCustom.trim()) {
    errors.material = "Informe o material personalizado ou escolha outra opção.";
  }
  if (state.materialType === "preset" && !state.materialPreset) {
    errors.material = "Selecione um material.";
  }
  return errors;
}

export function validateImages(state: ProductFormState): StepErrors {
  const errors: StepErrors = {};
  if (!state.images.length) {
    errors.images = "Informe pelo menos uma foto.";
  }
  return errors;
}

export function validateAll(state: ProductFormState): StepErrors {
  const materialErrors =
    state.materialType === "custom" || state.materialType === "preset"
      ? validateMaterial(state)
      : {};
  return {
    ...validateBasicInfo(state),
    ...materialErrors,
    ...validateImages(state),
  };
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

export function getResolvedMaterial(state: ProductFormState): string {
  return resolveMaterial(state);
}
