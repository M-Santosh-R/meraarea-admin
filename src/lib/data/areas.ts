import { prisma } from "@/lib/prisma";
import { toArea } from "@/lib/data/serializers";

export async function listAreas() {
  const areas = await prisma.area.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { businesses: true } } },
  });
  return areas.map((a) => ({ ...toArea(a), businessCount: a._count.businesses }));
}

export async function getArea(id: string) {
  const area = await prisma.area.findUnique({ where: { id } });
  return area ? toArea(area) : null;
}
