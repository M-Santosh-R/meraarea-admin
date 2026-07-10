import { CategoriesTable } from "@/components/categories/categories-table";
import { listCategories } from "@/lib/data/categories";

export default async function CategoriesPage() {
  const categories = await listCategories();
  return <CategoriesTable categories={categories} />;
}
