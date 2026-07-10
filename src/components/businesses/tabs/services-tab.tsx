"use client";

import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { BusinessFormState } from "@/components/businesses/business-form-types";
import { Service } from "@/lib/types";

export function ServicesTab({
  value,
  onChange,
  services,
}: {
  value: BusinessFormState;
  onChange: (patch: Partial<BusinessFormState>) => void;
  services: Service[];
}) {
  const selected = services.filter((s) => value.serviceIds.includes(s.id));

  function toggle(id: string) {
    const next = value.serviceIds.includes(id)
      ? value.serviceIds.filter((s) => s !== id)
      : [...value.serviceIds, id];
    onChange({ serviceIds: next });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Services Offered</p>
        <p className="text-sm text-muted-foreground">
          Search and select the services this business offers.
        </p>
      </div>

      {selected.length ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge
              key={s.id}
              variant="secondary"
              className="gap-1 rounded-full py-1 pl-2.5 pr-1"
            >
              {s.name}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${s.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Command className="rounded-lg border border-border">
        <CommandInput placeholder="Search services..." />
        <CommandList className="max-h-64">
          <CommandEmpty>No services found.</CommandEmpty>
          <CommandGroup>
            {services.map((s) => {
              const isSelected = value.serviceIds.includes(s.id);
              return (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  onSelect={() => toggle(s.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "flex size-4 items-center justify-center rounded border border-border",
                      isSelected && "border-accent bg-accent text-accent-foreground"
                    )}
                  >
                    {isSelected ? <Check className="size-3" /> : null}
                  </div>
                  {s.name}
                  {s.status === "inactive" ? (
                    <span className="ml-auto text-xs text-muted-foreground">Inactive</span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
