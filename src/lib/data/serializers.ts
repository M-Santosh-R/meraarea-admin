import type {
  Admin as PrismaAdmin,
  Area as PrismaArea,
  Category as PrismaCategory,
  Service as PrismaService,
  Business as PrismaBusiness,
  BusinessImage as PrismaBusinessImage,
  BusinessHour as PrismaBusinessHour,
  BusinessService as PrismaBusinessService,
} from "@prisma/client";
import type { Admin, Area, Business, Category, Service } from "@/lib/types";

export function toArea(area: PrismaArea): Area {
  return {
    id: area.id,
    name: area.name,
    slug: area.slug,
    type: area.type,
    parentId: area.parentId,
    country: area.country,
    state: area.state,
    city: area.city,
    locality: area.locality,
    description: area.description ?? "",
    imageUrl: area.imageUrl,
    seoTitle: area.seoTitle ?? "",
    seoDescription: area.seoDescription ?? "",
    isFeatured: area.isFeatured,
    status: area.status,
    createdAt: area.createdAt.toISOString(),
    updatedAt: area.updatedAt.toISOString(),
  };
}

export function toCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? "",
    description: category.description ?? "",
    imageUrl: category.imageUrl,
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
    displayOrder: category.displayOrder,
    status: category.status,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toService(service: PrismaService): Service {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description ?? "",
    status: service.status,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export function toAdmin(admin: PrismaAdmin): Admin {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    avatarUrl: admin.avatarUrl,
    lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
    createdAt: admin.createdAt.toISOString(),
  };
}

export type BusinessWithRelations = PrismaBusiness & {
  images: PrismaBusinessImage[];
  hours: PrismaBusinessHour[];
  services: PrismaBusinessService[];
};

export function toBusiness(business: BusinessWithRelations): Business {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    areaId: business.areaId,
    categoryId: business.categoryId,
    status: business.status,
    shortDescription: business.shortDescription ?? "",
    fullDescription: business.fullDescription ?? "",
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
    featuredHomepage: business.featuredHomepage,
    featuredAreaPage: business.featuredAreaPage,
    featuredUntil: business.featuredUntil ? business.featuredUntil.toISOString() : null,
    isVerified: business.isVerified,
    serviceIds: business.services.map((s) => s.serviceId),
    images: business.images
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        displayOrder: img.displayOrder,
        isCover: img.isCover,
      })),
    hours: business.hours.map((h) => ({
      day: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed,
    })),
    createdById: business.createdById,
    createdAt: business.createdAt.toISOString(),
    updatedAt: business.updatedAt.toISOString(),
  };
}
