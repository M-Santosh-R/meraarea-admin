import { prisma } from "@/lib/prisma";
import { toBusiness } from "@/lib/data/serializers";

const BUSINESS_INCLUDE = { images: true, hours: true, services: true };

export async function listBusinesses() {
  const businesses = await prisma.business.findMany({
    include: BUSINESS_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return businesses.map(toBusiness);
}

export async function getBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: BUSINESS_INCLUDE,
  });
  return business ? toBusiness(business) : null;
}
