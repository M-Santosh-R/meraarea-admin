import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api/http";
import {
  PUBLIC_AREA_WHERE,
  PUBLIC_BUSINESS_WHERE,
  PUBLIC_CATEGORY_WHERE,
  PUBLIC_SERVICE_WHERE,
  publicBusinessCount,
} from "@/lib/api/public/where";
import { BUSINESS_CARD_INCLUDE, toAreaSummary, toBusinessCard, toCategorySummary } from "@/lib/api/public/serializers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  if (!q) return jsonError("q is required.", 400);

  const limitParam = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 20) : 8;
  const contains = { contains: q, mode: "insensitive" as const };

  const [businessesByName, businessesByService, categories, areas] = await Promise.all([
    prisma.business.findMany({
      where: { ...PUBLIC_BUSINESS_WHERE, name: contains },
      include: BUSINESS_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.business.findMany({
      where: {
        ...PUBLIC_BUSINESS_WHERE,
        services: { some: { service: { ...PUBLIC_SERVICE_WHERE, name: contains } } },
      },
      include: BUSINESS_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.category.findMany({
      where: { ...PUBLIC_CATEGORY_WHERE, name: contains },
      include: { _count: publicBusinessCount() },
      take: limit,
    }),
    prisma.area.findMany({
      where: { ...PUBLIC_AREA_WHERE, name: contains },
      include: { _count: publicBusinessCount() },
      take: limit,
    }),
  ]);

  const seen = new Set<string>();
  const businesses = [...businessesByName, ...businessesByService]
    .filter((b) => (seen.has(b.id) ? false : (seen.add(b.id), true)))
    .slice(0, limit)
    .map(toBusinessCard);

  return jsonOk({
    query: q,
    businesses,
    categories: categories.map(toCategorySummary),
    areas: areas.map(toAreaSummary),
  });
}
