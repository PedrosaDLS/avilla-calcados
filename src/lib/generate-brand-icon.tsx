import { Resvg } from "@resvg/resvg-js";
import { access } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIR = join(process.cwd(), "public/fonts/itc-bauhaus");
const FONT_CANDIDATES = [
  "BauhausStd-Bold.ttf",
  "BauhausStd-Bold.woff2",
  "BauhausStd-Bold.woff",
  "BauhausStd-Heavy.ttf",
  "BauhausStd-Heavy.woff2",
  "BauhausStd-Heavy.woff",
] as const;

let fontPathPromise: Promise<string> | null = null;

async function loadBrandFontPath() {
  if (!fontPathPromise) {
    fontPathPromise = (async () => {
      for (const file of FONT_CANDIDATES) {
        const path = join(FONT_DIR, file);
        try {
          await access(path);
          return path;
        } catch {
          continue;
        }
      }

      throw new Error("Bauhaus Std font file not found for brand icon generation.");
    })();
  }

  return fontPathPromise;
}

function buildBrandIconSvg(size: number) {
  const fontSize = Math.round(size * 0.58);
  const radius = Math.round(size * 0.22);
  const center = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#FF0000" />
  <text
    x="${center}"
    y="${center}"
    fill="#000000"
    font-family="Bauhaus Std Bold, Bauhaus Std"
    font-weight="700"
    font-size="${fontSize}"
    text-anchor="middle"
    dominant-baseline="central"
    text-rendering="geometricPrecision"
  >á</text>
</svg>`;
}

export async function renderBrandIconPng(size: number) {
  const fontPath = await loadBrandFontPath();
  const svg = buildBrandIconSvg(size);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: {
      fontFiles: [fontPath],
      loadSystemFonts: false,
      defaultFontFamily: "Bauhaus Std Bold",
    },
  });

  return Buffer.from(resvg.render().asPng());
}

export async function generateBrandIcon(size: number) {
  const png = await renderBrandIconPng(size);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
