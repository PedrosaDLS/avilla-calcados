import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NovoModeloPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h2 className="text-xl font-medium">Novo modelo</h2>
      <p className="mt-2 mb-6 text-sm text-[var(--muted)]">
        Siga as 4 etapas para cadastrar um modelo no catálogo.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
