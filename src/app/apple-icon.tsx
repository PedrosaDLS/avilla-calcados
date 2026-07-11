import { generateBrandIcon } from "@/lib/generate-brand-icon";

export const runtime = "nodejs";
export const size = { width: 1024, height: 1024 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return generateBrandIcon(1024);
}
