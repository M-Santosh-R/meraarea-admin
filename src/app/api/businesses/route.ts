import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api/http";
import { PUBLIC_BUSINESS_WHERE } from "@/lib/api/public/where";

export async function GET() {
  const businesses = await prisma.business.findMany({
    where: PUBLIC_BUSINESS_WHERE,
    select: { slug: true, updatedAt: true, area: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  return jsonOk({
    businesses: businesses.map((b) => ({
      areaSlug: b.area.slug,
      slug: b.slug,
      updatedAt: b.updatedAt.toISOString(),
    })),
  });
}
