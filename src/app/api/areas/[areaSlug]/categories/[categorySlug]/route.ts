import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api/http";
import { PUBLIC_CATEGORY_WHERE, PUBLIC_BUSINESS_WHERE } from "@/lib/api/public/where";
import {
  getPublicAreaBySlug,
  getAllAreasFlat,
  getDescendantAreaIds,
  getBusinessCountsByArea,
  attachBusinessCount,
} from "@/lib/api/public/areas";
import { listPublicBusinesses } from "@/lib/api/public/businesses";
import { toAreaSummary, toCategorySummary } from "@/lib/api/public/serializers";

type Params = { params: Promise<{ areaSlug: string; categorySlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { areaSlug, categorySlug } = await params;

  const [area, allAreas] = await Promise.all([getPublicAreaBySlug(areaSlug), getAllAreasFlat()]);
  if (!area) return jsonError("Area not found.", 404);

  const descendantIds = await getDescendantAreaIds(area.id, allAreas);
  const areaIds = [area.id, ...descendantIds];

  const [category, businessCounts] = await Promise.all([
    prisma.category.findFirst({
      where: { ...PUBLIC_CATEGORY_WHERE, slug: categorySlug },
      include: {
        _count: { select: { businesses: { where: { ...PUBLIC_BUSINESS_WHERE, areaId: { in: areaIds } } } } },
      },
    }),
    getBusinessCountsByArea(allAreas),
  ]);
  if (!category) return jsonError("Category not found.", 404);

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? undefined;
  const featuredOnly = searchParams.get("featured") === "true";

  const businesses = await listPublicBusinesses({ areaIds, categoryId: category.id, sort, featuredOnly, page, limit });

  return jsonOk({
    area: toAreaSummary(attachBusinessCount(area, businessCounts)),
    category: toCategorySummary(category),
    businesses,
  });
}
