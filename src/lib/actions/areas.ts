"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { toArea } from "@/lib/data/serializers";
import { ActionError, toActionError } from "@/lib/actions/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { AreaType, PublishStatus } from "@/lib/types";

export interface AreaInput {
  name: string;
  slug: string;
  type: AreaType;
  parentId: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  locality: string | null;
  description: string;
  imageUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  status: PublishStatus;
}

function buildData(input: AreaInput) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim() ? slugify(input.slug) : slugify(input.name),
    type: input.type,
    parentId: input.parentId,
    country: input.country,
    state: input.state,
    city: input.city,
    locality: input.locality,
    description: input.description,
    imageUrl: input.imageUrl || null,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    isFeatured: input.isFeatured,
    status: input.status,
  };
}

export async function createArea(input: AreaInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Area name is required.");
    if (!input.slug.trim()) throw new ActionError("Slug is required.");

    const area = await prisma.area.create({ data: buildData(input) });
    revalidatePath("/areas");
    return toArea(area);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function updateArea(id: string, input: AreaInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Area name is required.");
    if (!input.slug.trim()) throw new ActionError("Slug is required.");

    const area = await prisma.area.update({ where: { id }, data: buildData(input) });
    revalidatePath("/areas");
    return toArea(area);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function deleteArea(id: string) {
  try {
    await requireAdmin();
    await prisma.area.delete({ where: { id } });
    revalidatePath("/areas");
  } catch (error) {
    throw toActionError(error);
  }
}
