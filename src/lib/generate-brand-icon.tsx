import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

let fontDataPromise: Promise<ArrayBuffer> | null = null;

async function loadBrandFont() {
  if (!fontDataPromise) {
    fontDataPromise = readFile(
      join(process.cwd(), "public/fonts/itc-bauhaus/BauhausStd-Heavy.woff")
    ).then((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  }
  return fontDataPromise;
}

export async function generateBrandIcon(size: number) {
  const fontData = await loadBrandFont();
  const fontSize = Math.round(size * 0.36);
  const radius = Math.round(size * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FF0000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            fontFamily: "Bauhaus Std",
            fontWeight: 900,
            fontSize,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            transform: "translateY(4%)",
          }}
        >
          ávilla
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Bauhaus Std",
          data: fontData,
          weight: 900,
          style: "normal",
        },
      ],
    }
  );
}
