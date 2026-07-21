import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FONT_PATH = join(process.cwd(), "public/fonts/itc-bauhaus/BauhausStd-Bold.ttf");

export type BrandIconOptions = {
  /** Extra padding so Android adaptive / maskable crops keep the á readable. */
  maskable?: boolean;
};

let fontDataPromise: Promise<ArrayBuffer> | null = null;

async function loadFontData() {
  if (!fontDataPromise) {
    fontDataPromise = readFile(FONT_PATH).then((file) =>
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    );
  }

  return fontDataPromise;
}

function brandIconMarkup(size: number, options: BrandIconOptions = {}) {
  const maskable = Boolean(options.maskable);
  // Maskable safe zone ≈ center 80%; keep glyph smaller so circle/squircle crops don't clip the accent.
  const fontSize = Math.round(size * (maskable ? 0.42 : 0.58));
  const radius = maskable ? 0 : Math.round(size * 0.22);
  // Acute accent makes the glyph look top-heavy; nudge down slightly for optical center.
  const nudgeY = Math.round(size * (maskable ? 0.02 : 0.015));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF0000",
        borderRadius: radius,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Bauhaus Std",
          fontSize,
          fontWeight: 700,
          color: "#000000",
          lineHeight: 1,
          transform: `translateY(${nudgeY}px)`,
        }}
      >
        á
      </span>
    </div>
  );
}

export async function renderBrandIconPng(size: number, options: BrandIconOptions = {}) {
  const fontData = await loadFontData();

  const response = new ImageResponse(brandIconMarkup(size, options), {
    width: size,
    height: size,
    fonts: [
      {
        name: "Bauhaus Std",
        data: fontData,
        style: "normal",
        weight: 700,
      },
    ],
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function generateBrandIcon(size: number, options: BrandIconOptions = {}) {
  const png = await renderBrandIconPng(size, options);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
