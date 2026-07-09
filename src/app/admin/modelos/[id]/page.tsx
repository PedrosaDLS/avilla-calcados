import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditModeloPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { colors: true, sizes: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium">Editar modelo</h2>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          promoPrice: product.promoPrice != null ? Number(product.promoPrice) : null,
          isLaunch: product.isLaunch,
          categoryId: product.categoryId,
          colors: product.colors.map((c) => ({ name: c.name, hex: c.hex })),
          sizes: product.sizes.map((s) => s.size),
          images: product.images.map((i) => ({ url: i.url })),
        }}
      />
    </div>
  );
}
