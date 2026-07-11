import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export default async function ModeloPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const uniqueImages = [...new Map(product.images.map((img) => [img.url, img])).values()];

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        material: product.material,
        price: Number(product.price),
        promoPrice: product.promoPrice != null ? Number(product.promoPrice) : null,
        isLaunch: product.isLaunch,
        category: product.category,
        images: uniqueImages.map((img) => ({ id: img.id, url: img.url })),
      }}
    />
  );
}
