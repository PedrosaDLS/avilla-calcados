export const GOPAGE_BASE_URL = "https://avillacalcados.gopage.bio";

export const GOPAGE_CATEGORIES = [
  { name: "Rasteira", slug: "rasteira" },
  { name: "Sandália", slug: "sandalia" },
  { name: "Papete", slug: "papete" },
  { name: "Slide", slug: "slide" },
  { name: "Chinelo", slug: "chinelo" },
  { name: "Sapatilha", slug: "sapatilha" },
  { name: "Tamanco", slug: "tamanco" },
  { name: "Mocassim", slug: "mocassim" },
  { name: "Plataforma", slug: "plataforma" },
  { name: "Chanel", slug: "chanel" },
  { name: "Mule", slug: "mule" },
  { name: "Sandália salto fino", slug: "sandalia-salto-fino" },
  { name: "Scarpin", slug: "scarpin" },
  { name: "Tênis", slug: "tenis" },
  { name: "Bota/Corturno", slug: "botacorturno" },
  { name: "Sleeper", slug: "sleeper" },
  { name: "Anabela", slug: "anabela" },
] as const;

export type GopageCategory = {
  id: number;
  name: string;
  slug: string;
};

export type GopageImage = {
  id: number;
  order: number;
  url: string;
  thumb: string;
};

export type GopageProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  highlight: boolean;
  has_variations: boolean;
  variations: unknown;
  images: GopageImage[];
  categories: GopageCategory[];
};

export type GopagePagination = {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_more_pages: boolean;
};

export type GopagePageData = {
  categories: GopageCategory[];
  products: GopageProduct[];
  pagination: GopagePagination;
};

type InertiaPayload = {
  props: {
    categories: GopageCategory[];
    productsList: {
      products: GopageProduct[];
      pagination: GopagePagination;
    };
  };
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseInertiaPage(html: string): GopagePageData {
  const match = html.match(/data-page="([^"]+)"/);
  if (!match) {
    throw new Error("data-page não encontrado no HTML do Gopage");
  }

  const decoded = decodeHtmlEntities(match[1]);
  const payload = JSON.parse(decoded) as InertiaPayload;

  return {
    categories: payload.props.categories ?? [],
    products: payload.props.productsList?.products ?? [],
    pagination: payload.props.productsList?.pagination ?? {
      current_page: 1,
      per_page: 16,
      total: 0,
      total_pages: 0,
      has_more_pages: false,
    },
  };
}

export async function fetchGopagePage(page = 1): Promise<GopagePageData> {
  const url = page <= 1 ? GOPAGE_BASE_URL : `${GOPAGE_BASE_URL}/?page=${page}`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "AvillaImport/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar página ${page}: HTTP ${response.status}`);
  }

  const html = await response.text();
  return parseInertiaPage(html);
}

export async function fetchAllGopageProducts(
  onlyPage?: number
): Promise<{ products: GopageProduct[]; categories: GopageCategory[] }> {
  const first = await fetchGopagePage(onlyPage ?? 1);
  const categories = first.categories;
  const bySlug = new Map<string, GopageProduct>();

  for (const product of first.products) {
    bySlug.set(product.slug, product);
  }

  if (onlyPage != null) {
    return { products: [...bySlug.values()], categories };
  }

  const totalPages = first.pagination.total_pages || 1;
  for (let page = 2; page <= totalPages; page++) {
    const data = await fetchGopagePage(page);
    for (const product of data.products) {
      bySlug.set(product.slug, product);
    }
    await delay(150);
  }

  return { products: [...bySlug.values()], categories };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MATERIAL_MAP: Record<string, string> = {
  Couro: "Couro Legítimo",
  Tecnológico: "Couro sintético",
  Nobuck: "Nobuck",
  Borracha: "Borracha",
};

export function extractGopageMaterial(description: string | null | undefined): string {
  if (!description?.trim()) return "";

  const match =
    description.match(/Material[:\s]*<\/[^>]+>\s*([^<\n]+)/i) ??
    description.match(/Material[:\s]+([^\n<]+)/i);

  if (!match) return "";

  const raw = match[1].replace(/<[^>]+>/g, "").trim();
  return MATERIAL_MAP[raw] ?? raw;
}
