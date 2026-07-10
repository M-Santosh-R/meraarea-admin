"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toAdmin } from "@/lib/data/serializers";
import { ActionError, toActionError } from "@/lib/actions/errors";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole, AdminStatus } from "@/lib/types";

export interface AdminInput {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  avatarUrl: string | null;
}

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

export async function createAdmin(input: AdminInput) {
  try {
    await requireAdmin();
    if (!input.name.trim() || !input.email.trim()) {
      throw new ActionError("Name and email are required.");
    }

    const email = input.email.trim().toLowerCase();
    const tempPassword = generateTempPassword();

    const supabaseAdmin = createAdminClient();
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (authError) {
      throw new ActionError(
        authError.message.includes("already been registered")
          ? "An account with this email already exists."
          : `Could not create login for this admin: ${authError.message}`
      );
    }

    let admin;
    try {
      admin = await prisma.admin.create({
        data: {
          name: input.name.trim(),
          email,
          role: input.role,
          status: input.status,
          avatarUrl: input.avatarUrl,
        },
      });
    } catch (error) {
      // Roll back the Supabase Auth user so the email isn't left stranded.
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const created = data.users.find((u) => u.email === email);
      if (created) await supabaseAdmin.auth.admin.deleteUser(created.id);
      throw error;
    }

    revalidatePath("/admins");
    return { admin: toAdmin(admin), tempPassword };
  } catch (error) {
    throw toActionError(error);
  }
}

export async function updateAdmin(
  id: string,
  input: { name: string; email: string; role?: AdminRole; status?: AdminStatus }
) {
  try {
    await requireAdmin();
    if (!input.name.trim() || !input.email.trim()) {
      throw new ActionError("Name and email are required.");
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        ...(input.role ? { role: input.role } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    });
    revalidatePath("/admins");
    revalidatePath("/profile");
    return toAdmin(admin);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function deleteAdmin(id: string) {
  try {
    await requireAdmin();
    await prisma.admin.delete({ where: { id } });
    revalidatePath("/admins");
  } catch (error) {
    throw toActionError(error);
  }
}
