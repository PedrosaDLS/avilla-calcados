export type Category = { id: string; name: string };

export type ColorEntry = { name: string; hex: string | null; sizes: string[] };

export type ImageEntry = { url: string; colorNames: string[] };

export type ProductFormInitial = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  promoPrice?: number | null;
  isLaunch?: boolean;
  categoryId?: string;
  colors?: ColorEntry[];
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
  images: ImageEntry[];
};

export const DEFAULT_SIZES = ["33", "34", "35", "36", "37", "38", "39"];

export const PRESET_COLORS: ColorEntry[] = [
  { name: "Preto", hex: "#1c1714", sizes: [] },
  { name: "Branco", hex: "#f7f3ee", sizes: [] },
  { name: "Nude", hex: "#d4b5a0", sizes: [] },
  { name: "Marrom", hex: "#6b4a3a", sizes: [] },
  { name: "Bege", hex: "#c9b8a8", sizes: [] },
  { name: "Vermelho", hex: "#8c3a3a", sizes: [] },
  { name: "Rosa", hex: "#c4899a", sizes: [] },
  { name: "Azul Marinho", hex: "#2a3441", sizes: [] },
];

export function normalizeColorName(name: string): string {
  return name.trim().toLowerCase();
}
