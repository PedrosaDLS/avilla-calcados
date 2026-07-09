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
  images: ImageEntry[];
};

export type FormTab = "form" | "review";

export const FORM_TABS: { id: FormTab; label: string }[] = [
  { id: "form", label: "Cadastro" },
  { id: "review", label: "Revisão" },
];

export const DEFAULT_SIZES = ["33", "34", "35", "36", "37", "38", "39"];
