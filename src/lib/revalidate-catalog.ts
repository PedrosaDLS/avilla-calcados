import { revalidatePath, revalidateTag } from "next/cache";

const IMMEDIATE = { expire: 0 } as const;

export function revalidateCatalog(slug?: string) {
  revalidateTag("home-page", IMMEDIATE);
  revalidateTag("products", IMMEDIATE);
  revalidateTag("filter-options", IMMEDIATE);
  revalidateTag("collection", IMMEDIATE);
  if (slug) revalidateTag(`product-${slug}`, IMMEDIATE);

  revalidatePath("/");
  revalidatePath("/colecao");
  if (slug) revalidatePath(`/modelo/${slug}`);
}
