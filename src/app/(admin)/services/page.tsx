import { ServicesTable } from "@/components/services/services-table";
import { listServices } from "@/lib/data/services";

export default async function ServicesPage() {
  const services = await listServices();
  return <ServicesTable services={services} />;
}
