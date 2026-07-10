import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api/http";
import { PUBLIC_AREA_WHERE } from "@/lib/api/public/where";
import { getBusinessCountsByArea, attachBusinessCount } from "@/lib/api/public/areas";
import { toAreaSummary } from "@/lib/api/public/serializers";

export async function GET() {
  const [areas, businessCounts] = await Promise.all([
    prisma.area.findMany({
      where: PUBLIC_AREA_WHERE,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    getBusinessCountsByArea(),
  ]);

  return jsonOk({
    areas: areas.map((area) => toAreaSummary(attachBusinessCount(area, businessCounts))),
  });
}
