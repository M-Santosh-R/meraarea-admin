import { AreaForm } from "@/components/areas/area-form";
import { getArea, listAreas } from "@/lib/data/areas";

export default async function EditAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [area, areas] = await Promise.all([getArea(id), listAreas()]);
  return <AreaForm mode="edit" area={area} areas={areas} />;
}
