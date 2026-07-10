"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BusinessFormState } from "@/components/businesses/business-form-types";

export function VisibilityTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Featured on Homepage</p>
          <p className="text-xs text-muted-foreground">
            Show this business in the homepage&apos;s featured listings.
          </p>
        </div>
        <Switch
          checked={value.featuredHomepage}
          onCheckedChange={(v) => onChange({ featuredHomepage: v })}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Featured on Area Page</p>
          <p className="text-xs text-muted-foreground">
            Show this business in the featured section of its area page.
          </p>
        </div>
        <Switch
          checked={value.featuredAreaPage}
          onCheckedChange={(v) => onChange({ featuredAreaPage: v })}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Verified Business</p>
          <p className="text-xs text-muted-foreground">
            Show a verified badge on the public listing.
          </p>
        </div>
        <Switch
          checked={value.isVerified}
          onCheckedChange={(v) => onChange({ isVerified: v })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-featured-until">Featured Until</Label>
        <Input
          id="biz-featured-until"
          type="date"
          value={value.featuredUntil ? value.featuredUntil.slice(0, 10) : ""}
          onChange={(e) =>
            onChange({
              featuredUntil: e.target.value
                ? new Date(e.target.value).toISOString()
                : null,
            })
          }
          disabled={!value.featuredHomepage && !value.featuredAreaPage}
          className="w-full sm:w-64"
        />
        <p className="text-xs text-muted-foreground">
          The business will automatically stop being featured after this date.
        </p>
      </div>
    </div>
  );
}
