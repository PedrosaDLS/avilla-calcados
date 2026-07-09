import { prisma } from "@/lib/prisma";
import { ShuffleHero } from "@/components/hero/ShuffleHero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { productCardInclude } from "@/lib/products";

const HIGHLIGHTS_LIMIT = 8;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroProducts, highlights] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ isLaunch: true }, { viewCount: { gt: 0 } }] },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ isLaunch: "desc" }, { viewCount: "desc" }],
      take: 12,
    }),
    prisma.product.findMany({
      include: productCardInclude,
      orderBy: { viewCount: "desc" },
      take: HIGHLIGHTS_LIMIT,
    }),
  ]);

  const hero = heroProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.images[0]?.url ?? null,
  }));

  const cards = highlights.map((p) => ({
    ...p,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
  }));

  return (
    <>
      <ShuffleHero products={hero} />
      <section className="relative isolate w-full px-4 py-14 md:px-6">
        <div className="relative z-10">
          <FeaturedSection products={cards} />
        </div>
      </section>
    </>
  );
}
