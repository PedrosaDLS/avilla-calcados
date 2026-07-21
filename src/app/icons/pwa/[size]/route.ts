import { generateBrandIcon } from "@/lib/generate-brand-icon";

const ALLOWED = new Set(["192", "512", "512-maskable"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  if (!ALLOWED.has(size)) {
    return new Response("Not found", { status: 404 });
  }

  if (size === "512-maskable") {
    return generateBrandIcon(512, { maskable: true });
  }

  return generateBrandIcon(Number(size));
}
