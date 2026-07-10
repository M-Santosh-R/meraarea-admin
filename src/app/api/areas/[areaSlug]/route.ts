import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api/http";
import {
  PUBLIC_CATEGORY_WHERE,
  PUBLIC_BUSINESS_WHERE,
  activeFeaturedWhere,
} from "@/lib/api/public/where";
import {
  getPublicAreaBySlug,
  getAreaAncestors,
  getDescendantAreaIds,
  getSiblingAreas,
  getBusinessCountsByArea,
  attachBusinessCount,
} from "@/lib/api/public/areas";
import { listPublicBusinesses } from "@/lib/api/public/businesses";
import { BUSINESS_CARD_INCLUDE, toAreaDetail, toAreaSummary, toBusinessCard, toCategorySummary } from "@/lib/api/public/serializers";

type Params = { params: Promise<{ areaSlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { areaSlug } = await params;
  const area = await getPublicAreaBySlug(areaSlug);
  if (!area) return jsonError("Area not found.", 404);

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? undefined;
  const featuredOnly = searchParams.get("featured") === "true";

  const descendantIds = await getDescendantAreaIds(area.id);
  const areaIds = [area.id, ...descendantIds];

  const [breadcrumb, categoriesInArea, featuredBusinesses, businesses, nearbyAreas, businessCounts] =
    await Promise.all([
      getAreaAncestors(area),
      prisma.category.findMany({
        where: { ...PUBLIC_CATEGORY_WHERE, businesses: { some: { areaId: { in: areaIds }, status: "published" } } },
        include: { _count: { select: { businesses: { where: { ...PUBLIC_BUSINESS_WHERE, areaId: { in: areaIds } } } } } },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      prisma.business.findMany({
        where: {
          ...PUBLIC_BUSINESS_WHERE,
          areaId: { in: areaIds },
          featuredAreaPage: true,
          ...activeFeaturedWhere(),
        },
        include: BUSINESS_CARD_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      listPublicBusinesses({ areaIds, sort, featuredOnly, page, limit }),
      getSiblingAreas(area),
      getBusinessCountsByArea(),
    ]);

  return jsonOk({
    area: toAreaDetail(attachBusinessCount(area, businessCounts), breadcrumb),
    categoriesInArea: categoriesInArea.map(toCategorySummary),
    featuredBusinesses: featuredBusinesses.map(toBusinessCard),
    businesses,
    nearbyAreas: nearbyAreas.map((a) => toAreaSummary(attachBusinessCount(a, businessCounts))),
  });
}
