"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { toCategory } from "@/lib/data/serializers";
import { ActionError, toActionError } from "@/lib/actions/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { PublishStatus } from "@/lib/types";

export interface CategoryInput {
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  status: PublishStatus;
}

function buildData(input: CategoryInput) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim() ? slugify(input.slug) : slugify(input.name),
    icon: input.icon,
    description: input.description,
    imageUrl: input.imageUrl || null,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    displayOrder: input.displayOrder,
    status: input.status,
  };
}

export async function createCategory(input: CategoryInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Category name is required.");

    const category = await prisma.category.create({ data: buildData(input) });
    revalidatePath("/categories");
    return toCategory(category);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function updateCategory(id: string, input: CategoryInput) {
  try {
    await requireAdmin();
    if (!input.name.trim()) throw new ActionError("Category name is required.");

    const category = await prisma.category.update({ where: { id }, data: buildData(input) });
    revalidatePath("/categories");
    return toCategory(category);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();
    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
  } catch (error) {
    throw toActionError(error);
  }
}
