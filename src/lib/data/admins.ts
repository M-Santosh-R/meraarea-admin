import { prisma } from "@/lib/prisma";
import { toAdmin } from "@/lib/data/serializers";
import { getCurrentAdminFromSession } from "@/lib/auth/session";

export async function listAdmins() {
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "desc" } });
  return admins.map(toAdmin);
}

export async function getAdmin(id: string) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  return admin ? toAdmin(admin) : null;
}

/** The signed-in admin, resolved from the real Supabase session. */
export async function getCurrentAdmin() {
  return getCurrentAdminFromSession();
}
