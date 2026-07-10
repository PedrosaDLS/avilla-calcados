type ColorRef = { id: string; name: string };

type ImagePayload = {
  url: string;
  sortOrder: number;
  colorName?: string | null;
  colorNames?: string[];
};

export function imageColorNames(img: ImagePayload): (string | null)[] {
  if (img.colorNames?.length) {
    return img.colorNames.map((name) => name.trim()).filter(Boolean);
  }
  if (img.colorName?.trim()) {
    return [img.colorName.trim()];
  }
  return [null];
}

export function expandImagesForDb(
  images: ImagePayload[],
  colors: ColorRef[]
): { url: string; sortOrder: number; colorId: string | null }[] {
  const rows: { url: string; sortOrder: number; colorId: string | null }[] = [];

  for (const img of images) {
    const names = imageColorNames(img);
    for (const colorName of names) {
      const color = colorName
        ? colors.find((c) => c.name.toLowerCase() === colorName.toLowerCase())
        : null;
      rows.push({
        url: img.url,
        sortOrder: img.sortOrder,
        colorId: color?.id ?? null,
      });
    }
  }

  return rows;
}

export function groupImagesForForm(
  images: { url: string; sortOrder: number; colorId: string | null }[],
  colors: ColorRef[]
): { url: string; colorNames: string[] }[] {
  const grouped: { url: string; colorNames: string[] }[] = [];
  const indexByUrl = new Map<string, number>();

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const img of sorted) {
    const colorName = img.colorId
      ? colors.find((c) => c.id === img.colorId)?.name ?? null
      : null;
    const existingIndex = indexByUrl.get(img.url);

    if (existingIndex !== undefined) {
      if (colorName && !grouped[existingIndex].colorNames.includes(colorName)) {
        grouped[existingIndex].colorNames.push(colorName);
      }
      continue;
    }

    indexByUrl.set(img.url, grouped.length);
    grouped.push({
      url: img.url,
      colorNames: colorName ? [colorName] : [],
    });
  }

  return grouped;
}
