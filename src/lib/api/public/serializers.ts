import type { Prisma, Area as PrismaArea, Category as PrismaCategory } from "@prisma/client";
import type {
  AreaBreadcrumbEntry,
  AreaDetail,
  AreaSummary,
  BusinessCard,
  BusinessDetail,
  CategoryDetail,
  CategorySummary,
} from "@/lib/api/public/types";

export const BUSINESS_CARD_INCLUDE = {
  area: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: [{ isCover: "desc" }, { displayOrder: "asc" }],
    take: 1,
  },
} satisfies Prisma.BusinessInclude;

export const BUSINESS_DETAIL_INCLUDE = {
  area: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { displayOrder: "asc" } },
  hours: true,
  services: {
    include: { service: { select: { id: true, name: true, slug: true, description: true } } },
  },
} satisfies Prisma.BusinessInclude;

export type BusinessCardRow = Prisma.BusinessGetPayload<{ include: typeof BUSINESS_CARD_INCLUDE }>;
export type BusinessDetailRow = Prisma.BusinessGetPayload<{ include: typeof BUSINESS_DETAIL_INCLUDE }>;

export function toBusinessCard(business: BusinessCardRow): BusinessCard {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    shortDescription: business.shortDescription ?? "",
    address: business.address ?? "",
    coverImageUrl: business.images[0]?.url ?? null,
    featuredHomepage: business.featuredHomepage,
    featuredAreaPage: business.featuredAreaPage,
    isVerified: business.isVerified,
    phone: business.phone ?? "",
    whatsapp: business.whatsapp ?? "",
    area: business.area,
    category: business.category,
  };
}

export function toBusinessDetail(
  business: BusinessDetailRow,
  areaBreadcrumb: AreaBreadcrumbEntry[]
): BusinessDetail {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    shortDescription: business.shortDescription ?? "",
    fullDescription: business.fullDescription ?? "",
    isVerified: business.isVerified,
    phone: business.phone ?? "",
    alternatePhone: business.alternatePhone ?? "",
    whatsapp: business.whatsapp ?? "",
    email: business.email ?? "",
    website: business.website ?? "",
    address: business.address ?? "",
    googleMapsUrl: business.googleMapsUrl ?? "",
    latitude: business.latitude ? business.latitude.toNumber() : null,
    longitude: business.longitude ? business.longitude.toNumber() : null,
    seoTitle: business.seoTitle ?? "",
    seoDescription: business.seoDescription ?? "",
    area: {
      id: business.area.id,
      name: business.area.name,
      slug: business.area.slug,
      breadcrumb: areaBreadcrumb,
    },
    category: business.category,
    images: business.images
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({ url: img.url, displayOrder: img.displayOrder, isCover: img.isCover })),
    hours: business.hours.map((h) => ({
      day: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed,
    })),
    services: business.services.map((s) => ({ ...s.service, description: s.service.description ?? "" })),
  };
}

export function toAreaSummary(
  area: PrismaArea & { _count: { businesses: number } }
): AreaSummary {
  return {
    id: area.id,
    name: area.name,
    slug: area.slug,
    type: area.type,
    city: area.city,
    state: area.state,
    isFeatured: area.isFeatured,
    businessCount: area._count.businesses,
    imageUrl: area.imageUrl,
  };
}

export function toAreaDetail(
  area: PrismaArea & { _count: { businesses: number } },
  breadcrumb: AreaBreadcrumbEntry[]
): AreaDetail {
  return {
    ...toAreaSummary(area),
    description: area.description ?? "",
    seoTitle: area.seoTitle ?? "",
    seoDescription: area.seoDescription ?? "",
    breadcrumb,
  };
}

export function toCategorySummary(
  category: PrismaCategory & { _count: { businesses: number } }
): CategorySummary {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? "",
    businessCount: category._count.businesses,
    imageUrl: category.imageUrl,
  };
}

export function toCategoryDetail(
  category: PrismaCategory & { _count: { businesses: number } }
): CategoryDetail {
  return {
    ...toCategorySummary(category),
    description: category.description ?? "",
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
  };
}
