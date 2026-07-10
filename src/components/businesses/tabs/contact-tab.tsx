"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessFormState } from "@/components/businesses/business-form-types";

export function ContactTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  return (
    <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="biz-phone">Phone</Label>
        <Input
          id="biz-phone"
          value={value.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+91 98250 12345"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-alt-phone">Alternate Phone</Label>
        <Input
          id="biz-alt-phone"
          value={value.alternatePhone}
          onChange={(e) => onChange({ alternatePhone: e.target.value })}
          placeholder="+91 79 2686 1234"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-whatsapp">WhatsApp</Label>
        <Input
          id="biz-whatsapp"
          value={value.whatsapp}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
          placeholder="+91 98250 12345"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-email">Email</Label>
        <Input
          id="biz-email"
          type="email"
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="contact@business.in"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="biz-website">Website</Label>
        <Input
          id="biz-website"
          value={value.website}
          onChange={(e) => onChange({ website: e.target.value })}
          placeholder="https://business.in"
        />
      </div>
    </div>
  );
}
