import { AdminsTable } from "@/components/admins/admins-table";
import { listAdmins, getCurrentAdmin } from "@/lib/data/admins";

export default async function AdminsPage() {
  const [admins, currentAdmin] = await Promise.all([listAdmins(), getCurrentAdmin()]);
  return <AdminsTable admins={admins} currentAdminId={currentAdmin?.id ?? null} />;
}
