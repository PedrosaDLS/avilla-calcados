import { generateBrandIcon } from "@/lib/generate-brand-icon";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return generateBrandIcon(32);
}
