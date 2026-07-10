import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLIC_BUSINESS_WHERE, activeFeaturedWhere } from "@/lib/api/public/where";
import type { Paginated } from "@/lib/api/public/types";
import {
  BUSINESS_CARD_INCLUDE,
  BUSINESS_DETAIL_INCLUDE,
  toBusinessCard,
  toBusinessDetail,
} from "@/lib/api/public/serializers";
import { getAreaAncestors } from "@/lib/api/public/areas";

function clampPage(page: number | undefined) {
  return Number.isFinite(page) && (page as number) >= 1 ? Math.floor(page as number) : 1;
}

function clampLimit(limit: number | undefined, fallback = 20, max = 50) {
  return Number.isFinite(limit) && (limit as number) >= 1
    ? Math.min(Math.floor(limit as number), max)
    : fallback;
}

function businessSortOrder(sort: string | undefined): Prisma.BusinessOrderByWithRelationInput[] {
  if (sort === "featured") {
    return [{ featuredAreaPage: "desc" }, { createdAt: "desc" }];
  }
  return [{ createdAt: "desc" }];
}

export async function listPublicBusinesses(options: {
  areaIds?: string[];
  categoryId?: string;
  sort?: string;
  featuredOnly?: boolean;
  page?: number;
  limit?: number;
}): Promise<Paginated<ReturnType<typeof toBusinessCard>>> {
  const page = clampPage(options.page);
  const limit = clampLimit(options.limit);

  const where: Prisma.BusinessWhereInput = {
    ...PUBLIC_BUSINESS_WHERE,
    ...(options.areaIds?.length ? { areaId: { in: options.areaIds } } : {}),
    ...(options.categoryId ? { categoryId: options.categoryId } : {}),
    ...(options.featuredOnly ? { featuredAreaPage: true, ...activeFeaturedWhere() } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: BUSINESS_CARD_INCLUDE,
      orderBy: businessSortOrder(options.sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.business.count({ where }),
  ]);

  return {
    data: rows.map(toBusinessCard),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

export async function getRelatedBusinesses(
  business: { id: string; areaId: string; categoryId: string },
  take = 6
) {
  const sameAreaAndCategory = await prisma.business.findMany({
    where: {
      ...PUBLIC_BUSINESS_WHERE,
      categoryId: business.categoryId,
      areaId: business.areaId,
      id: { not: business.id },
    },
    include: BUSINESS_CARD_INCLUDE,
    orderBy: [{ createdAt: "desc" }],
    take,
  });

  if (sameAreaAndCategory.length >= take) {
    return sameAreaAndCategory.map(toBusinessCard);
  }

  const remaining = take - sameAreaAndCategory.length;
  const excludeIds = [business.id, ...sameAreaAndCategory.map((b) => b.id)];
  const sameCategoryOtherAreas = await prisma.business.findMany({
    where: {
      ...PUBLIC_BUSINESS_WHERE,
      categoryId: business.categoryId,
      id: { notIn: excludeIds },
    },
    include: BUSINESS_CARD_INCLUDE,
    orderBy: [{ createdAt: "desc" }],
    take: remaining,
  });

  return [...sameAreaAndCategory, ...sameCategoryOtherAreas].map(toBusinessCard);
}

export async function getPublicBusinessBySlug(areaId: string, businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { ...PUBLIC_BUSINESS_WHERE, areaId, slug: businessSlug },
    include: BUSINESS_DETAIL_INCLUDE,
  });
  if (!business) return null;

  const breadcrumb = await getAreaAncestors(business.area);
  return toBusinessDetail(business, breadcrumb);
}
