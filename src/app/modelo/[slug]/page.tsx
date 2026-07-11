import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export default async function ModeloPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Suspense fallback={null}>
      <ProductDetailClient
        product={{
          ...product,
          price: Number(product.price),
          promoPrice: product.promoPrice != null ? Number(product.promoPrice) : null,
        }}
      />
    </Suspense>
  );
}
