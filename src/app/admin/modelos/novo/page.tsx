import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NovoModeloPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h2 className="mb-6 text-xl font-medium">Novo modelo</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
