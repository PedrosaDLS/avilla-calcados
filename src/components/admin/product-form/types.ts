export type Category = { id: string; name: string };

export type ImageEntry = { url: string };

export const PRESET_MATERIALS = [
  "Couro Legítimo",
  "Couro sintético",
  "Nobuck",
  "Camurça",
] as const;

export type ProductFormInitial = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  promoPrice?: number | null;
  isLaunch?: boolean;
  categoryId?: string;
  material?: string;
  images?: ImageEntry[];
};

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  promoPrice: string;
  isLaunch: boolean;
  categoryId: string;
  materialType: "preset" | "custom" | "";
  materialPreset: string;
  materialCustom: string;
  images: ImageEntry[];
};

export function resolveMaterial(state: ProductFormState): string {
  if (state.materialType === "custom") return state.materialCustom.trim();
  if (state.materialType === "preset") return state.materialPreset;
  return "";
}

export function materialToFormState(material?: string): Pick<
  ProductFormState,
  "materialType" | "materialPreset" | "materialCustom"
> {
  const trimmed = material?.trim() ?? "";
  if (!trimmed) {
    return { materialType: "", materialPreset: "", materialCustom: "" };
  }
  if ((PRESET_MATERIALS as readonly string[]).includes(trimmed)) {
    return { materialType: "preset", materialPreset: trimmed, materialCustom: "" };
  }
  return { materialType: "custom", materialPreset: "", materialCustom: trimmed };
}
