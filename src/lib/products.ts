import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  search?: string;
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): ProductFilters {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const getList = (k: string) => {
    const v = sp[k];
    if (!v) return [];
    const raw = Array.isArray(v) ? v.join(",") : v;
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const minPrice = get("minPrice") ? Number(get("minPrice")) : undefined;
  const maxPrice = get("maxPrice") ? Number(get("maxPrice")) : undefined;

  return {
    minPrice: minPrice != null && !Number.isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
    colors: getList("cor"),
    sizes: getList("tamanho"),
    categories: getList("categoria"),
    search: get("q") || undefined,
  };
}

export function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.minPrice != null || filters.maxPrice != null) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (filters.minPrice != null) priceFilter.gte = filters.minPrice;
    if (filters.maxPrice != null) priceFilter.lte = filters.maxPrice;
    and.push({
      OR: [
        { promoPrice: { not: null, ...priceFilter } },
        {
          AND: [
            { promoPrice: null },
            { price: priceFilter },
          ],
        },
      ],
    });
  }

  if (filters.colors?.length) {
    and.push({
      colors: { some: { name: { in: filters.colors, mode: "insensitive" } } },
    });
  }

  if (filters.sizes?.length) {
    and.push({
      sizes: { some: { size: { in: filters.sizes } } },
    });
  }

  if (filters.categories?.length) {
    and.push({
      category: { slug: { in: filters.categories } },
    });
  }

  if (filters.search) {
    and.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (and.length) where.AND = and;
  return where;
}

export const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 2 },
  colors: true,
  sizes: true,
  category: true,
} satisfies Prisma.ProductInclude;

export async function getFilterOptions() {
  const [categories, colors, sizes, priceAgg] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productColor.findMany({
      distinct: ["name"],
      select: { name: true, hex: true },
      orderBy: { name: "asc" },
    }),
    prisma.productSize.findMany({
      distinct: ["size"],
      select: { size: true },
      orderBy: { size: "asc" },
    }),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  return {
    categories,
    colors,
    sizes: sizes.map((s) => s.size),
    priceRange: {
      min: Number(priceAgg._min.price ?? 0),
      max: Number(priceAgg._max.price ?? 1000),
    },
  };
}
