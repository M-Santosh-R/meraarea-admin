"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { areaBreadcrumb } from "@/lib/selectors";
import { slugify } from "@/lib/slug";
import { BusinessFormState } from "@/components/businesses/business-form-types";
import { Area, BusinessStatus, Category } from "@/lib/types";

export function BasicTab({
  value,
  onChange,
  onNameChange,
  onSlugTouch,
  areas,
  categories,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
  onNameChange: (name: string) => void;
  onSlugTouch: () => void;
  areas: Area[];
  categories: Category[];
}) {
  const sortedAreas = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="biz-name">Business Name</Label>
        <Input
          id="biz-name"
          value={value.name}
          onChange={(e) => {
            onChange({ name: e.target.value });
            onNameChange(e.target.value);
          }}
          placeholder="e.g. Vikram Dental Care"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-slug">Slug</Label>
        <Input
          id="biz-slug"
          value={value.slug}
          onChange={(e) => {
            onChange({ slug: slugify(e.target.value) });
            onSlugTouch();
          }}
          placeholder="vikram-dental-care"
        />
        <p className="text-xs text-muted-foreground">
          Public URL preview: /
          {sortedAreas.find((a) => a.id === value.areaId)?.slug ?? "area"}/
          {value.slug || "business-slug"}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Area</Label>
          <Select value={value.areaId} onValueChange={(v) => onChange({ areaId: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an area" />
            </SelectTrigger>
            <SelectContent>
              {sortedAreas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {areaBreadcrumb(a, areas)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={value.categoryId}
            onValueChange={(v) => onChange({ categoryId: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {sortedCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={value.status}
          onValueChange={(v) => onChange({ status: v as BusinessStatus })}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
