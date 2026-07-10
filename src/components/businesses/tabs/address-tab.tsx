"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessFormState } from "@/components/businesses/business-form-types";

export function AddressTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="biz-address">Address</Label>
        <Textarea
          id="biz-address"
          rows={3}
          value={value.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Shop 302, Shivalik Complex, Satellite Road, Ahmedabad, Gujarat 380015"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-maps-url">Google Maps URL</Label>
        <Input
          id="biz-maps-url"
          value={value.googleMapsUrl}
          onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
          placeholder="https://maps.google.com/?q=..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="biz-lat">Latitude</Label>
          <Input
            id="biz-lat"
            type="number"
            step="0.0001"
            value={value.latitude ?? ""}
            onChange={(e) =>
              onChange({
                latitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="23.0225"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="biz-lng">Longitude</Label>
          <Input
            id="biz-lng"
            type="number"
            step="0.0001"
            value={value.longitude ?? ""}
            onChange={(e) =>
              onChange({
                longitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="72.5714"
          />
        </div>
      </div>
    </div>
  );
}
