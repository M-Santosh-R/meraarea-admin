import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api/http";
import { PUBLIC_CATEGORY_WHERE, publicBusinessCount } from "@/lib/api/public/where";
import { toCategorySummary } from "@/lib/api/public/serializers";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: PUBLIC_CATEGORY_WHERE,
    include: { _count: publicBusinessCount() },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return jsonOk({ categories: categories.map(toCategorySummary) });
}
