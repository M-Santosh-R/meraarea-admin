import { AreaForm } from "@/components/areas/area-form";
import { listAreas } from "@/lib/data/areas";

export default async function NewAreaPage() {
  const areas = await listAreas();
  return <AreaForm mode="create" areas={areas} />;
}
