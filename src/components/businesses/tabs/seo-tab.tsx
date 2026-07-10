"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessFormState } from "@/components/businesses/business-form-types";

export function SeoTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="biz-seo-title">SEO Title</Label>
        <Input
          id="biz-seo-title"
          value={value.seoTitle}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          placeholder={`${value.name || "Business Name"} – Best in your area | MeraArea`}
        />
        <p className="text-xs text-muted-foreground">
          {value.seoTitle.length}/60 characters recommended
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-seo-description">SEO Description</Label>
        <Textarea
          id="biz-seo-description"
          rows={3}
          value={value.seoDescription}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
          placeholder="A concise summary shown in search engine results."
        />
        <p className="text-xs text-muted-foreground">
          {value.seoDescription.length}/160 characters recommended
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Search preview
        </p>
        <p className="truncate text-[15px] text-accent">
          {value.seoTitle || value.name || "Business Name"} | MeraArea
        </p>
        <p className="truncate text-xs text-success">meraarea.in/area/{value.slug || "business-slug"}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {value.seoDescription || value.shortDescription || "Description will appear here."}
        </p>
      </div>
    </div>
  );
}
