"use client";

import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DAY_LABELS } from "@/lib/constants";
import { BusinessFormState } from "@/components/businesses/business-form-types";
import { BusinessHour } from "@/lib/types";

export function HoursTab({
  value,
  onChange,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
}) {
  function updateDay(day: BusinessHour["day"], patch: Partial<BusinessHour>) {
    onChange({
      hours: value.hours.map((h) => (h.day === day ? { ...h, ...patch } : h)),
    });
  }

  function copyMondayToAll() {
    const monday = value.hours.find((h) => h.day === "monday");
    if (!monday) return;
    onChange({
      hours: value.hours.map((h) =>
        h.day === "monday"
          ? h
          : { ...h, openTime: monday.openTime, closeTime: monday.closeTime, isClosed: monday.isClosed }
      ),
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Business Hours</p>
          <p className="text-sm text-muted-foreground">
            Set opening hours for each day of the week.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copyMondayToAll}>
          <Copy className="size-3.5" />
          Copy Monday to all days
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border">
        {value.hours.map((h) => (
          <div key={h.day} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="w-24 shrink-0 text-sm font-medium text-foreground">
              {DAY_LABELS[h.day]}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor={`${h.day}-open`} className="sr-only">
                  Open time
                </Label>
                <Input
                  id={`${h.day}-open`}
                  type="time"
                  disabled={h.isClosed}
                  value={h.openTime ?? ""}
                  onChange={(e) => updateDay(h.day, { openTime: e.target.value })}
                  className="w-32"
                />
              </div>
              <span className="text-sm text-muted-foreground">to</span>
              <div className="flex items-center gap-1.5">
                <Label htmlFor={`${h.day}-close`} className="sr-only">
                  Close time
                </Label>
                <Input
                  id={`${h.day}-close`}
                  type="time"
                  disabled={h.isClosed}
                  value={h.closeTime ?? ""}
                  onChange={(e) => updateDay(h.day, { closeTime: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`${h.day}-closed`} className="text-sm text-muted-foreground">
                Closed
              </Label>
              <Switch
                id={`${h.day}-closed`}
                checked={h.isClosed}
                onCheckedChange={(v) => updateDay(h.day, { isClosed: v })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
