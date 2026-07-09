export type Category = { id: string; name: string };

export type ColorEntry = { name: string; hex: string | null };

export type ImageEntry = { url: string; colorName?: string | null };

export type ProductFormInitial = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  promoPrice?: number | null;
  isLaunch?: boolean;
  categoryId?: string;
  colors?: ColorEntry[];
  sizes?: string[];
  images?: ImageEntry[];
};

export type ProductFormState = {
  name: string;
  description: string;
  price: string;
  promoPrice: string;
  isLaunch: boolean;
  categoryId: string;
  colors: ColorEntry[];
  sizes: string[];
  extraSizes: string;
  images: ImageEntry[];
};

export const STEPS = [
  { id: 1, label: "Informações" },
  { id: 2, label: "Cores e tamanhos" },
  { id: 3, label: "Fotos" },
  { id: 4, label: "Revisar" },
] as const;

export const DEFAULT_SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];
