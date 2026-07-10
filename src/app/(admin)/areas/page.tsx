import { AreasTable } from "@/components/areas/areas-table";
import { listAreas } from "@/lib/data/areas";

export default async function AreasPage() {
  const areas = await listAreas();
  return <AreasTable areas={areas} />;
}
