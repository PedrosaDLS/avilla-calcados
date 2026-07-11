import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FONT_PATH = join(process.cwd(), "public/fonts/itc-bauhaus/BauhausStd-Bold.ttf");

let fontDataPromise: Promise<ArrayBuffer> | null = null;

async function loadFontData() {
  if (!fontDataPromise) {
    fontDataPromise = readFile(FONT_PATH).then((file) =>
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    );
  }

  return fontDataPromise;
}

function brandIconMarkup(size: number) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.58);

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
          fontFamily: "Bauhaus Std",
          fontSize,
          fontWeight: 700,
          color: "#000000",
          lineHeight: 1,
        }}
      >
        á
      </span>
    </div>
  );
}

export async function renderBrandIconPng(size: number) {
  const fontData = await loadFontData();

  const response = new ImageResponse(brandIconMarkup(size), {
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

export async function generateBrandIcon(size: number) {
  const png = await renderBrandIconPng(size);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
