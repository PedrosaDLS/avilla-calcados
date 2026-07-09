import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NovoModeloPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h2 className="text-xl font-medium">Novo modelo</h2>
      <p className="mt-2 mb-6 text-sm text-[var(--muted)]">
        Preencha todos os campos abaixo e revise ao final antes de publicar.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
