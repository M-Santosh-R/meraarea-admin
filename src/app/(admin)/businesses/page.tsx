import { BusinessesTable } from "@/components/businesses/businesses-table";
import { listBusinesses } from "@/lib/data/businesses";
import { listAreas } from "@/lib/data/areas";
import { listCategories } from "@/lib/data/categories";

export default async function BusinessesPage() {
  const [businesses, areas, categories] = await Promise.all([
    listBusinesses(),
    listAreas(),
    listCategories(),
  ]);

  return <BusinessesTable businesses={businesses} areas={areas} categories={categories} />;
}
