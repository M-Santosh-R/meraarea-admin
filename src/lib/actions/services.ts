"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { toService } from "@/lib/data/serializers";
import { ActionError, toActionError } from "@/lib/actions/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { ServiceStatus } from "@/lib/types";

export interface ServiceInput {
  name: string;
  slug: string;
  description?: string;
  status: ServiceStatus;
}

export async function createService(input: ServiceInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Service name is required.");

    const service = await prisma.service.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.trim() ? slugify(input.slug) : slugify(input.name),
        description: input.description?.trim() || null,
        status: input.status,
      },
    });
    revalidatePath("/services");
    return toService(service);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function updateService(id: string, input: ServiceInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Service name is required.");

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: input.name.trim(),
        slug: input.slug.trim() ? slugify(input.slug) : slugify(input.name),
        description: input.description?.trim() || null,
        status: input.status,
      },
    });
    revalidatePath("/services");
    return toService(service);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function deleteService(id: string) {
  try {
    await requireAdmin();
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
  } catch (error) {
    throw toActionError(error);
  }
}
