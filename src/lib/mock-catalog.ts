import type { ProductFilters } from "@/lib/products";

const now = new Date("2026-01-01T00:00:00.000Z");

const categories = [
  { id: "cat-sandalia", name: "Sandálias", slug: "sandalias" },
  { id: "cat-rasteira", name: "Rasteiras", slug: "rasteiras" },
  { id: "cat-scarpin", name: "Scarpins", slug: "scarpins" },
  { id: "cat-tenis", name: "Tênis", slug: "tenis" },
];

const baseProducts = [
  {
    id: "mock-1",
    name: "Sandália Anabela Nude",
    slug: "sandalia-anabela-nude",
    description: "Salto anabela confortável para o dia a dia.",
    price: 189.9,
    promoPrice: 159.9,
    isLaunch: true,
    viewCount: 120,
    categoryId: "cat-sandalia",
    category: categories[0],
    createdAt: now,
    updatedAt: now,
    imageSeed: 41,
    colors: [
      { id: "c1", name: "Nude", hex: "#d8b89a" },
      { id: "c2", name: "Preto", hex: "#1a1a1a" },
    ],
    sizes: ["34", "35", "36", "37", "38"],
  },
  {
    id: "mock-2",
    name: "Rasteira Trançada Caramelo",
    slug: "rasteira-trancada-caramelo",
    description: "Couro sintético com detalhe trançado.",
    price: 139.9,
    promoPrice: null,
    isLaunch: false,
    viewCount: 98,
    categoryId: "cat-rasteira",
    category: categories[1],
    createdAt: now,
    updatedAt: now,
    imageSeed: 52,
    colors: [{ id: "c3", name: "Caramelo", hex: "#a66b3f" }],
    sizes: ["35", "36", "37", "38", "39"],
  },
  {
    id: "mock-3",
    name: "Scarpin Clássico Vermelho",
    slug: "scarpin-classico-vermelho",
    description: "Salto médio com bico fino.",
    price: 219.9,
    promoPrice: 189.9,
    isLaunch: true,
    viewCount: 76,
    categoryId: "cat-scarpin",
    category: categories[2],
    createdAt: now,
    updatedAt: now,
    imageSeed: 63,
    colors: [
      { id: "c4", name: "Vermelho", hex: "#b42318" },
      { id: "c5", name: "Preto", hex: "#1a1a1a" },
    ],
    sizes: ["34", "35", "36", "37"],
  },
  {
    id: "mock-4",
    name: "Tênis Casual Branco",
    slug: "tenis-casual-branco",
    description: "Leve e versátil para looks urbanos.",
    price: 179.9,
    promoPrice: null,
    isLaunch: false,
    viewCount: 64,
    categoryId: "cat-tenis",
    category: categories[3],
    createdAt: now,
    updatedAt: now,
    imageSeed: 74,
    colors: [
      { id: "c6", name: "Branco", hex: "#f5f5f5" },
      { id: "c7", name: "Rosa", hex: "#e8a0b8" },
    ],
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: "mock-5",
    name: "Sandália Flat Dourada",
    slug: "sandalia-flat-dourada",
    description: "Tiras finas com acabamento metalizado.",
    price: 149.9,
    promoPrice: null,
    isLaunch: false,
    viewCount: 55,
    categoryId: "cat-sandalia",
    category: categories[0],
    createdAt: now,
    updatedAt: now,
    imageSeed: 85,
    colors: [{ id: "c8", name: "Dourado", hex: "#c9a227" }],
    sizes: ["35", "36", "37", "38"],
  },
  {
    id: "mock-6",
    name: "Rasteira Fivela Preta",
    slug: "rasteira-fivela-preta",
    description: "Modelo minimalista com fivela lateral.",
    price: 129.9,
    promoPrice: 109.9,
    isLaunch: false,
    viewCount: 41,
    categoryId: "cat-rasteira",
    category: categories[1],
    createdAt: now,
    updatedAt: now,
    imageSeed: 96,
    colors: [{ id: "c9", name: "Preto", hex: "#1a1a1a" }],
    sizes: ["34", "35", "36", "37", "38", "39"],
  },
  {
    id: "mock-7",
    name: "Scarpin Suede Bege",
    slug: "scarpin-suede-bege",
    description: "Acabamento suede com salto bloco.",
    price: 239.9,
    promoPrice: null,
    isLaunch: true,
    viewCount: 33,
    categoryId: "cat-scarpin",
    category: categories[2],
    createdAt: now,
    updatedAt: now,
    imageSeed: 107,
    colors: [{ id: "c10", name: "Bege", hex: "#d4c4a8" }],
    sizes: ["35", "36", "37", "38"],
  },
  {
    id: "mock-8",
    name: "Tênis Chunky Off White",
    slug: "tenis-chunky-off-white",
    description: "Solado robusto e conforto extra.",
    price: 199.9,
    promoPrice: 169.9,
    isLaunch: false,
    viewCount: 28,
    categoryId: "cat-tenis",
    category: categories[3],
    createdAt: now,
    updatedAt: now,
    imageSeed: 118,
    colors: [{ id: "c11", name: "Off White", hex: "#efe9df" }],
    sizes: ["36", "37", "38", "39", "40"],
  },
] as const;

function imageUrl(seed: number, index = 0) {
  return `https://picsum.photos/seed/avilla-${seed}-${index}/800/1000`;
}

function toCardProduct(product: (typeof baseProducts)[number]) {
  return {
    ...product,
    colors: product.colors.map((color) => ({ ...color, productId: product.id })),
    sizes: product.sizes.map((size, index) => ({
      id: `${product.id}-size-${index}`,
      productId: product.id,
      size,
    })),
    images: [
      { id: `${product.id}-img-1`, productId: product.id, url: imageUrl(product.imageSeed, 0), sortOrder: 0, colorId: null },
      { id: `${product.id}-img-2`, productId: product.id, url: imageUrl(product.imageSeed, 1), sortOrder: 1, colorId: null },
    ],
  };
}

const products = baseProducts.map(toCardProduct);

function effectivePrice(price: number, promoPrice: number | null) {
  return promoPrice != null && promoPrice < price ? promoPrice : price;
}

function matchesFilters(product: (typeof products)[number], filters: ProductFilters) {
  const price = effectivePrice(product.price, product.promoPrice);

  if (filters.minPrice != null && price < filters.minPrice) return false;
  if (filters.maxPrice != null && price > filters.maxPrice) return false;
  if (filters.categories?.length && !filters.categories.includes(product.category.slug)) return false;
  if (filters.colors?.length && !product.colors.some((color) => filters.colors!.includes(color.name))) {
    return false;
  }
  if (filters.sizes?.length && !product.sizes.some((size) => filters.sizes!.includes(size.size))) {
    return false;
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    const haystack = `${product.name} ${product.description}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  return true;
}

export function getMockFilterOptions() {
  const prices = products.map((product) => effectivePrice(product.price, product.promoPrice));

  return {
    categories,
    colors: Array.from(
      new Map(products.flatMap((product) => product.colors).map((color) => [color.name, color])).values()
    ),
    sizes: Array.from(new Set(products.flatMap((product) => product.sizes.map((size) => size.size)))).sort(),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
  };
}

export function getMockHomePageData() {
  const heroProducts = [...products]
    .filter((product) => product.isLaunch || product.viewCount > 0)
    .sort((a, b) => {
      if (a.isLaunch !== b.isLaunch) return a.isLaunch ? -1 : 1;
      return b.viewCount - a.viewCount;
    })
    .slice(0, 12);

  const highlights = [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);

  return {
    heroProducts: heroProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images[0]?.url ?? null,
    })),
    highlights,
  };
}

export function getMockCollectionPageData(filters: ProductFilters, page: number, pageSize: number) {
  const filtered = products
    .filter((product) => matchesFilters(product, filters))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { total, totalPages, page: safePage, products: items };
}

export function getMockProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}
