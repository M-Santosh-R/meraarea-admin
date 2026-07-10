import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentAdmin } from "@/lib/data/admins";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldAlert } from "lucide-react";

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No admin account found"
        description="Add an admin from the Admins page to see a profile here."
      />
    );
  }

  return <ProfileForm admin={admin} />;
}
