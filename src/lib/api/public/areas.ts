import { prisma } from "@/lib/prisma";
import { PUBLIC_AREA_WHERE, PUBLIC_BUSINESS_WHERE } from "@/lib/api/public/where";
import type { AreaBreadcrumbEntry } from "@/lib/api/public/types";
import type { AreaType } from "@prisma/client";

export async function getPublicAreaBySlug(slug: string) {
  return prisma.area.findFirst({
    where: { ...PUBLIC_AREA_WHERE, slug },
  });
}

type FlatArea = { id: string; name: string; slug: string; parentId: string | null };

/**
 * The full areas table, flattened for in-memory tree walks. Small even at
 * multi-city scale, so callers that need more than one derived view of the
 * hierarchy (ancestors, descendants, counts) in the same request should fetch
 * this once and pass it to each `*From`/optional-`allAreas` helper below,
 * instead of each helper re-fetching the whole table independently.
 */
export async function getAllAreasFlat(): Promise<FlatArea[]> {
  return prisma.area.findMany({ select: { id: true, name: true, slug: true, parentId: true } });
}

/**
 * Walks the parentId chain up to the root, root-first. Areas table is small
 * even at multi-city scale (same premise as getDescendantAreaIds below), so
 * one flat fetch plus an in-memory walk beats one sequential round trip per
 * hierarchy level (country > state > city > locality).
 */
export async function getAreaAncestors(
  area: { parentId: string | null },
  preloadedAreas?: FlatArea[]
): Promise<AreaBreadcrumbEntry[]> {
  if (!area.parentId) return [];

  const allAreas = preloadedAreas ?? (await getAllAreasFlat());
  const byId = new Map(allAreas.map((a) => [a.id, a]));

  const ancestors: AreaBreadcrumbEntry[] = [];
  let parentId: string | null = area.parentId;
  while (parentId) {
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift({ id: parent.id, name: parent.name, slug: parent.slug });
    parentId = parent.parentId;
  }

  return ancestors;
}

/**
 * Sibling areas — same parent, excluding the area itself. "Same parent" only
 * means "nearby" for cities and localities (e.g. other localities in the same
 * city). At the state/country level, siblings are just other states/countries
 * under the same parent — not geographically close — so callers should treat
 * this as meaningless "nearby areas" content above the city level.
 */
export async function getSiblingAreas(area: { id: string; parentId: string | null; type: AreaType }, limit = 8) {
  if (area.type !== "city" && area.type !== "locality") return [];

  return prisma.area.findMany({
    where: { ...PUBLIC_AREA_WHERE, parentId: area.parentId, id: { not: area.id } },
    orderBy: { name: "asc" },
    take: limit,
  });
}

/**
 * Returns every descendant area id under `areaId` (not including itself).
 * The areas table is small even at multi-city scale, so one flat fetch plus
 * an in-memory tree walk is simpler than a recursive SQL CTE.
 */
export async function getDescendantAreaIds(areaId: string, preloadedAreas?: FlatArea[]): Promise<string[]> {
  const allAreas = preloadedAreas ?? (await getAllAreasFlat());

  const childrenByParent = new Map<string, string[]>();
  for (const area of allAreas) {
    if (!area.parentId) continue;
    const siblings = childrenByParent.get(area.parentId) ?? [];
    siblings.push(area.id);
    childrenByParent.set(area.parentId, siblings);
  }

  const descendants: string[] = [];
  const queue = [...(childrenByParent.get(areaId) ?? [])];
  while (queue.length) {
    const id = queue.shift()!;
    descendants.push(id);
    queue.push(...(childrenByParent.get(id) ?? []));
  }

  return descendants;
}

/**
 * Rolled-up publicly-visible business count per area, aggregating each area's
 * own businesses plus every descendant area's businesses. Parent areas (e.g.
 * a state or country) never have businesses assigned directly — only their
 * descendant cities/localities do — so a plain `_count` on the area's own
 * `businesses` relation shows 0 (or an undercount) for anything above
 * locality level. Computed for every area in two queries total (one flat
 * area fetch, one grouped business count) plus an in-memory post-order sum,
 * rather than one query per area.
 */
export async function getBusinessCountsByArea(preloadedAreas?: FlatArea[]): Promise<Map<string, number>> {
  const [allAreas, directCounts] = await Promise.all([
    preloadedAreas ?? getAllAreasFlat(),
    prisma.business.groupBy({
      by: ["areaId"],
      where: PUBLIC_BUSINESS_WHERE,
      _count: { _all: true },
    }),
  ]);

  const directCountByArea = new Map<string, number>();
  for (const row of directCounts) {
    directCountByArea.set(row.areaId, row._count._all);
  }

  const childrenByParent = new Map<string, string[]>();
  for (const area of allAreas) {
    if (!area.parentId) continue;
    const siblings = childrenByParent.get(area.parentId) ?? [];
    siblings.push(area.id);
    childrenByParent.set(area.parentId, siblings);
  }

  const rolledUpCounts = new Map<string, number>();
  function total(areaId: string): number {
    const cached = rolledUpCounts.get(areaId);
    if (cached !== undefined) return cached;
    let sum = directCountByArea.get(areaId) ?? 0;
    for (const childId of childrenByParent.get(areaId) ?? []) {
      sum += total(childId);
    }
    rolledUpCounts.set(areaId, sum);
    return sum;
  }

  for (const area of allAreas) total(area.id);
  return rolledUpCounts;
}

/**
 * Attaches a rolled-up business count (from `getBusinessCountsByArea`) to an
 * area row in the `_count.businesses` shape `toAreaSummary`/`toAreaDetail`
 * expect, standing in for Prisma's own `_count` include.
 */
export function attachBusinessCount<T extends { id: string }>(
  area: T,
  counts: Map<string, number>
): T & { _count: { businesses: number } } {
  return { ...area, _count: { businesses: counts.get(area.id) ?? 0 } };
}
