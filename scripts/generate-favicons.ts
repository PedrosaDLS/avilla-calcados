import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pngToIco from "png-to-ico";
import { renderBrandIconPng } from "../src/lib/generate-brand-icon";

async function main() {
  const root = process.cwd();
  const iconsDir = join(root, "public/icons");
  mkdirSync(iconsDir, { recursive: true });

  const faviconSizes = [16, 32, 48, 64, 128, 256];
  const faviconPngs = await Promise.all(faviconSizes.map((size) => renderBrandIconPng(size)));
  const ico = await pngToIco(faviconPngs);
  const faviconPath = join(root, "src/app/favicon.ico");
  writeFileSync(faviconPath, ico);
  console.log(`Wrote ${faviconPath} (${ico.length} bytes)`);

  const assets: Array<{ file: string; size: number; maskable?: boolean }> = [
    { file: "pwa-192.png", size: 192 },
    { file: "pwa-512.png", size: 512 },
    { file: "pwa-512-maskable.png", size: 512, maskable: true },
    { file: "apple-touch-icon.png", size: 180 },
  ];

  for (const asset of assets) {
    const png = await renderBrandIconPng(asset.size, { maskable: asset.maskable });
    const path = join(iconsDir, asset.file);
    writeFileSync(path, png);
    console.log(`Wrote ${path} (${png.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
