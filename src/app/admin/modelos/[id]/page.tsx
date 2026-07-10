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
      <h2 className="text-xl font-medium">Editar modelo</h2>
      <p className="mt-2 mb-6 text-sm text-[var(--muted)]">
        Atualize os campos abaixo e revise ao final antes de salvar.
      </p>
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
          colors: product.colors.map((c) => ({
            name: c.name,
            hex: c.hex,
            sizes: product.sizes
              .filter((s) => s.colorId === c.id)
              .map((s) => s.size)
              .sort((a, b) => Number(a) - Number(b)),
          })),
          images: product.images.map((i) => ({
            url: i.url,
            colorName: i.colorId
              ? product.colors.find((c) => c.id === i.colorId)?.name ?? null
              : null,
          })),
        }}
      />
    </div>
  );
}
