import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api/http";
import { getPublicAreaBySlug } from "@/lib/api/public/areas";
import { getPublicBusinessBySlug, getRelatedBusinesses } from "@/lib/api/public/businesses";

type Params = { params: Promise<{ areaSlug: string; businessSlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { areaSlug, businessSlug } = await params;

  const area = await getPublicAreaBySlug(areaSlug);
  if (!area) return jsonError("Business not found.", 404);

  const business = await getPublicBusinessBySlug(area.id, businessSlug);
  if (!business) return jsonError("Business not found.", 404);

  const { searchParams } = request.nextUrl;
  const relatedLimit = Number(searchParams.get("relatedLimit") ?? "6");

  const relatedBusinesses = await getRelatedBusinesses(
    { id: business.id, areaId: area.id, categoryId: business.category.id },
    Number.isFinite(relatedLimit) && relatedLimit > 0 ? relatedLimit : 6
  );

  return jsonOk({ business, relatedBusinesses });
}
