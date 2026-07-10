import { prisma } from "@/lib/prisma";
import { toCategory } from "@/lib/data/serializers";

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { businesses: true } } },
  });
  return categories.map((c) => ({ ...toCategory(c), businessCount: c._count.businesses }));
}

export async function getCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  return category ? toCategory(category) : null;
}
