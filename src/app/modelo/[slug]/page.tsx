import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export default async function ModeloPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      colors: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) notFound();

  return (
    <ProductDetailClient
      product={{
        ...product,
        price: Number(product.price),
        promoPrice: product.promoPrice != null ? Number(product.promoPrice) : null,
      }}
    />
  );
}
