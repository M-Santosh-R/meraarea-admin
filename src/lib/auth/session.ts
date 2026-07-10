import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { toAdmin } from "@/lib/data/serializers";
import { ActionError } from "@/lib/actions/errors";

/** The verified Supabase user for the current request, or null if signed out. */
export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Resolves the signed-in Supabase user to our Admin row (matched by email).
 * Returns null rather than throwing — for use in data-fetching contexts
 * (Server Components) where "not signed in" should render as "no admin",
 * not crash the page. src/proxy.ts is what actually gates access.
 */
export async function getCurrentAdminFromSession() {
  const user = await getSupabaseUser();
  if (!user?.email) return null;

  const admin = await prisma.admin.findUnique({ where: { email: user.email.toLowerCase() } });
  return admin ? toAdmin(admin) : null;
}

/**
 * For Server Actions: resolves the current admin or throws. Every mutation
 * in src/lib/actions/*.ts must call this first — Server Actions are reachable
 * directly over the network, not just through the UI, so client-side route
 * gating alone is not sufficient.
 */
export async function requireAdmin() {
  const admin = await getCurrentAdminFromSession();
  if (!admin) {
    throw new ActionError("You must be signed in to do that.");
  }
  return admin;
}
