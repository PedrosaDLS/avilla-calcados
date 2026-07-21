import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getMockCollectionPageData,
  getMockFilterOptions,
  getMockHomePageData,
  getMockProductBySlug,
} from "@/lib/mock-catalog";
import { useMockData } from "@/lib/mock-mode";
import {
  buildProductWhere,
  productCardInclude,
  type ProductFilters,
} from "@/lib/products";

const HIGHLIGHTS_LIMIT = 8;
const HERO_LIMIT = 12;

async function fetchHomePageData() {
  const [heroProducts, highlights] = await Promise.all([
    prisma.product.findMany({
      where: {
        isHidden: false,
        images: { some: {} },
        OR: [{ isLaunch: true }, { viewCount: { gt: 0 } }],
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ isLaunch: "desc" }, { viewCount: "desc" }],
      take: HERO_LIMIT,
    }),
    prisma.product.findMany({
      where: { isHidden: false },
      include: productCardInclude,
      orderBy: { viewCount: "desc" },
      take: HIGHLIGHTS_LIMIT,
    }),
  ]);

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

export async function getHomePageData() {
  if (useMockData()) {
    return getMockHomePageData();
  }

  return unstable_cache(fetchHomePageData, ["home-page-data"], {
    revalidate: 120,
    tags: ["home-page", "products"],
  })();
}

async function fetchCollectionPageData(
  filters: ProductFilters,
  page: number,
  pageSize: number
) {
  const where = buildProductWhere(filters);
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
    products,
  };
}

export async function getCollectionPageData(
  filters: ProductFilters,
  page: number,
  pageSize: number
) {
  if (useMockData()) {
    return getMockCollectionPageData(filters, page, pageSize);
  }

  const cacheKey = [
    "collection",
    JSON.stringify(filters),
    String(page),
    String(pageSize),
  ];

  return unstable_cache(
    () => fetchCollectionPageData(filters, page, pageSize),
    cacheKey,
    { revalidate: 60, tags: ["products", "collection"] }
  )();
}

async function fetchFilterOptions() {
  const [categories, colors, sizes, priceAgg] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productColor.findMany({
      where: { product: { isHidden: false } },
      distinct: ["name"],
      select: { name: true, hex: true },
      orderBy: { name: "asc" },
    }),
    prisma.productSize.findMany({
      where: { product: { isHidden: false } },
      distinct: ["size"],
      select: { size: true },
      orderBy: { size: "asc" },
    }),
    prisma.product.aggregate({
      where: { isHidden: false },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  return {
    categories,
    colors,
    sizes: sizes.map((size) => size.size),
    priceRange: {
      min: Number(priceAgg._min.price ?? 0),
      max: Number(priceAgg._max.price ?? 1000),
    },
  };
}

export async function getFilterOptions() {
  if (useMockData()) {
    return getMockFilterOptions();
  }

  return unstable_cache(fetchFilterOptions, ["filter-options"], {
    revalidate: 300,
    tags: ["filter-options", "products"],
  })();
}

export async function getProductBySlug(slug: string) {
  if (useMockData()) {
    return getMockProductBySlug(slug);
  }

  return unstable_cache(
    () =>
      prisma.product.findFirst({
        where: { slug, isHidden: false },
        include: {
          category: true,
          colors: true,
          sizes: { orderBy: { size: "asc" } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ["product", slug],
    { revalidate: 120, tags: ["products", `product-${slug}`] }
  )();
}
