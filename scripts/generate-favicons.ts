import { writeFileSync } from "node:fs";
import { join } from "node:path";
import pngToIco from "png-to-ico";
import { renderBrandIconPng } from "../src/lib/generate-brand-icon";

async function main() {
  const pngSizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(pngSizes.map((size) => renderBrandIconPng(size)));
  const ico = await pngToIco(pngBuffers);

  const faviconPath = join(process.cwd(), "src/app/favicon.ico");
  writeFileSync(faviconPath, ico);
  console.log(`Wrote ${faviconPath} (${ico.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
