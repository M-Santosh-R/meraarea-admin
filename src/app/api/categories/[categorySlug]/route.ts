import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api/http";
import { PUBLIC_CATEGORY_WHERE, publicBusinessCount } from "@/lib/api/public/where";
import { listPublicBusinesses } from "@/lib/api/public/businesses";
import { toCategoryDetail } from "@/lib/api/public/serializers";

type Params = { params: Promise<{ categorySlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { categorySlug } = await params;
  const category = await prisma.category.findFirst({
    where: { ...PUBLIC_CATEGORY_WHERE, slug: categorySlug },
    include: { _count: publicBusinessCount() },
  });
  if (!category) return jsonError("Category not found.", 404);

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? undefined;
  const featuredOnly = searchParams.get("featured") === "true";

  const businesses = await listPublicBusinesses({ categoryId: category.id, sort, featuredOnly, page, limit });

  return jsonOk({
    category: toCategoryDetail(category),
    businesses,
  });
}
