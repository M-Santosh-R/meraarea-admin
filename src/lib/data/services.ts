import { prisma } from "@/lib/prisma";
import { toService } from "@/lib/data/serializers";

export async function listServices() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { businesses: true } } },
  });
  return services.map((s) => ({ ...toService(s), businessCount: s._count.businesses }));
}
