import { getHomePageData } from "@/lib/catalog";
import { ShuffleHero } from "@/components/hero/ShuffleHero";
import { FeaturedSection } from "@/components/home/FeaturedSection";

export const revalidate = 120;

export default async function HomePage() {
  const { heroProducts: hero, highlights } = await getHomePageData();

  const cards = highlights.map((p) => ({
    ...p,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
  }));

  return (
    <>
      <ShuffleHero products={hero} />
      <section className="relative isolate w-full px-4 py-14 md:px-6">
        <FeaturedSection products={cards} />
      </section>
    </>
  );
}
