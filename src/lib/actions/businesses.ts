"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { toBusiness } from "@/lib/data/serializers";
import { ActionError, toActionError } from "@/lib/actions/errors";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessFormState } from "@/components/businesses/business-form-types";

const BUSINESS_INCLUDE = { images: true, hours: true, services: true };

const IMAGE_BUCKET = "business-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadBusinessImage(formData: FormData) {
  try {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ActionError("No file provided.");
    }
    if (!file.type.startsWith("image/")) {
      throw new ActionError("Only image files are allowed.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new ActionError("Images must be 5MB or smaller.");
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${randomUUID()}.${ext}`;

    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      throw new ActionError(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (error) {
    throw toActionError(error);
  }
}

function scalarData(input: BusinessFormState) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim() ? slugify(input.slug) : slugify(input.name),
    areaId: input.areaId,
    categoryId: input.categoryId,
    status: input.status,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    phone: input.phone,
    alternatePhone: input.alternatePhone,
    whatsapp: input.whatsapp,
    email: input.email,
    website: input.website,
    address: input.address,
    googleMapsUrl: input.googleMapsUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    featuredHomepage: input.featuredHomepage,
    featuredAreaPage: input.featuredAreaPage,
    featuredUntil: input.featuredUntil ? new Date(input.featuredUntil) : null,
    isVerified: input.isVerified,
  };
}

function validate(input: BusinessFormState) {
  if (!input.name.trim()) throw new ActionError("Business name is required.");
  if (!input.slug.trim()) throw new ActionError("Slug is required.");
  if (!input.areaId || !input.categoryId) {
    throw new ActionError("Area and Category are required.");
  }
}

export async function createBusiness(
  input: BusinessFormState & { createdById: string | null }
) {
  try {
    await requireAdmin();
    validate(input);

    const business = await prisma.business.create({
      data: {
        ...scalarData(input),
        createdById: input.createdById,
        images: {
          create: input.images.map((img, i) => ({
            url: img.url,
            displayOrder: img.displayOrder ?? i,
            isCover: img.isCover,
          })),
        },
        hours: {
          create: input.hours.map((h) => ({
            dayOfWeek: h.day,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        },
        services: { create: input.serviceIds.map((serviceId) => ({ serviceId })) },
      },
      include: BUSINESS_INCLUDE,
    });

    revalidatePath("/businesses");
    revalidatePath("/dashboard");
    return toBusiness(business);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function updateBusiness(id: string, input: BusinessFormState) {
  try {
    await requireAdmin();
    validate(input);

    const business = await prisma.$transaction(async (tx) => {
      await tx.businessImage.deleteMany({ where: { businessId: id } });
      await tx.businessHour.deleteMany({ where: { businessId: id } });
      await tx.businessService.deleteMany({ where: { businessId: id } });

      return tx.business.update({
        where: { id },
        data: {
          ...scalarData(input),
          images: {
            create: input.images.map((img, i) => ({
              url: img.url,
              displayOrder: img.displayOrder ?? i,
              isCover: img.isCover,
            })),
          },
          hours: {
            create: input.hours.map((h) => ({
              dayOfWeek: h.day,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
            })),
          },
          services: { create: input.serviceIds.map((serviceId) => ({ serviceId })) },
        },
        include: BUSINESS_INCLUDE,
      });
    });

    revalidatePath("/businesses");
    revalidatePath("/dashboard");
    return toBusiness(business);
  } catch (error) {
    throw toActionError(error);
  }
}

export async function deleteBusiness(id: string) {
  try {
    await requireAdmin();
    await prisma.business.delete({ where: { id } });
    revalidatePath("/businesses");
    revalidatePath("/dashboard");
  } catch (error) {
    throw toActionError(error);
  }
}
