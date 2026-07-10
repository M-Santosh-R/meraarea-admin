import { BusinessForm } from "@/components/businesses/business-form";
import { listAreas } from "@/lib/data/areas";
import { listCategories } from "@/lib/data/categories";
import { listServices } from "@/lib/data/services";
import { getCurrentAdmin } from "@/lib/data/admins";

export default async function NewBusinessPage() {
  const [areas, categories, services, currentAdmin] = await Promise.all([
    listAreas(),
    listCategories(),
    listServices(),
    getCurrentAdmin(),
  ]);

  return (
    <BusinessForm
      mode="create"
      areas={areas}
      categories={categories}
      services={services}
      currentAdminId={currentAdmin?.id ?? null}
    />
  );
}
