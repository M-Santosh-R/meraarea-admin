import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api/http";
import {
  PUBLIC_AREA_WHERE,
  PUBLIC_BUSINESS_WHERE,
  PUBLIC_CATEGORY_WHERE,
  activeFeaturedWhere,
  publicBusinessCount,
} from "@/lib/api/public/where";
import { getBusinessCountsByArea, attachBusinessCount } from "@/lib/api/public/areas";
import { BUSINESS_CARD_INCLUDE, toAreaSummary, toBusinessCard, toCategorySummary } from "@/lib/api/public/serializers";

export async function GET() {
  const [
    popularCategories,
    featuredAreas,
    featuredBusinesses,
    recentBusinesses,
    totalBusinesses,
    verifiedBusinesses,
    totalAreas,
    totalCategories,
    businessCounts,
  ] = await Promise.all([
    prisma.category.findMany({
      where: PUBLIC_CATEGORY_WHERE,
      include: { _count: publicBusinessCount() },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      take: 12,
    }),
    prisma.area.findMany({
      where: { ...PUBLIC_AREA_WHERE, isFeatured: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.business.findMany({
      where: { ...PUBLIC_BUSINESS_WHERE, featuredHomepage: true, ...activeFeaturedWhere() },
      include: BUSINESS_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.business.findMany({
      where: PUBLIC_BUSINESS_WHERE,
      include: BUSINESS_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.business.count({ where: PUBLIC_BUSINESS_WHERE }),
    prisma.business.count({ where: { ...PUBLIC_BUSINESS_WHERE, isVerified: true } }),
    prisma.area.count({ where: PUBLIC_AREA_WHERE }),
    prisma.category.count({ where: PUBLIC_CATEGORY_WHERE }),
    getBusinessCountsByArea(),
  ]);

  return jsonOk({
    popularCategories: popularCategories.map(toCategorySummary),
    featuredAreas: featuredAreas.map((area) => toAreaSummary(attachBusinessCount(area, businessCounts))),
    featuredBusinesses: featuredBusinesses.map(toBusinessCard),
    recentBusinesses: recentBusinesses.map(toBusinessCard),
    stats: { totalBusinesses, verifiedBusinesses, totalAreas, totalCategories },
  });
}
