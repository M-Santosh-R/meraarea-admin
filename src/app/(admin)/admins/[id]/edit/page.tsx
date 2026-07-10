import { AdminForm } from "@/components/admins/admin-form";
import { getAdmin } from "@/lib/data/admins";

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await getAdmin(id);
  return <AdminForm mode="edit" admin={admin} />;
}
