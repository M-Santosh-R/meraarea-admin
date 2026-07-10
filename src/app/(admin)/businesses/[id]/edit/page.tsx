import { BusinessForm } from "@/components/businesses/business-form";
import { getBusiness } from "@/lib/data/businesses";
import { listAreas } from "@/lib/data/areas";
import { listCategories } from "@/lib/data/categories";
import { listServices } from "@/lib/data/services";
import { getCurrentAdmin } from "@/lib/data/admins";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [business, areas, categories, services, currentAdmin] = await Promise.all([
    getBusiness(id),
    listAreas(),
    listCategories(),
    listServices(),
    getCurrentAdmin(),
  ]);

  return (
    <BusinessForm
      mode="edit"
      business={business}
      areas={areas}
      categories={categories}
      services={services}
      currentAdminId={currentAdmin?.id ?? null}
    />
  );
}
