"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessFormState } from "@/components/businesses/business-form-types";

export function DescriptionTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="biz-short-desc">Short Description</Label>
        <Textarea
          id="biz-short-desc"
          rows={2}
          maxLength={160}
          value={value.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="A one-line summary shown in search results and cards."
        />
        <p className="text-xs text-muted-foreground">
          {value.shortDescription.length}/160 characters
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-full-desc">Full Description</Label>
        <Textarea
          id="biz-full-desc"
          rows={8}
          value={value.fullDescription}
          onChange={(e) => onChange({ fullDescription: e.target.value })}
          placeholder="Detailed information shown on the business's public page."
        />
      </div>
    </div>
  );
}
