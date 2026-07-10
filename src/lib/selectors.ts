import { Area, Category } from "@/lib/types";

export function areaBreadcrumb(area: Area, areas: Area[]): string {
  const parts: string[] = [area.name];
  let current = area;
  while (current.parentId) {
    const parent = areas.find((a) => a.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(" / ");
}

export function areaName(areaId: string, areas: Area[]): string {
  return areas.find((a) => a.id === areaId)?.name ?? "Unknown Area";
}

export function categoryName(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.name ?? "Unknown Category";
}

export const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  published: {
    label: "Published",
    className: "bg-success/10 text-success border-success/20",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  draft: {
    label: "Draft",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
};
