import { CategoryForm } from "@/components/categories/category-form";
import { getCategory } from "@/lib/data/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);
  return <CategoryForm mode="edit" category={category} />;
}
