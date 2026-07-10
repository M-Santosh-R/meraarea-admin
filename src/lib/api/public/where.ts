import type { Prisma } from "@prisma/client";

export const PUBLIC_AREA_WHERE = {
  status: "published",
} satisfies Prisma.AreaWhereInput;

export const PUBLIC_CATEGORY_WHERE = {
  status: "published",
} satisfies Prisma.CategoryWhereInput;

export const PUBLIC_SERVICE_WHERE = {
  status: "active",
} satisfies Prisma.ServiceWhereInput;

/**
 * A business is only publicly visible if it AND its area AND its category
 * are all published — a published business under a draft area/category must
 * not leak through. Every public business query must go through this.
 */
export const PUBLIC_BUSINESS_WHERE = {
  status: "published",
  area: { is: PUBLIC_AREA_WHERE },
  category: { is: PUBLIC_CATEGORY_WHERE },
} satisfies Prisma.BusinessWhereInput;

export function activeFeaturedWhere(): Prisma.BusinessWhereInput {
  return {
    OR: [{ featuredUntil: null }, { featuredUntil: { gte: new Date() } }],
  };
}

/**
 * Count of publicly-visible businesses, for `_count` on Area/Category queries.
 * Filters to `PUBLIC_BUSINESS_WHERE` so counts never include draft/archived rows.
 */
export function publicBusinessCount() {
  return { select: { businesses: { where: PUBLIC_BUSINESS_WHERE } } };
}
