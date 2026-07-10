"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSlugField } from "@/hooks/use-slug-field";
import { createService, updateService } from "@/lib/actions/services";
import { Service, ServiceStatus } from "@/lib/types";

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(service);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ServiceStatus>("active");
  const slugField = useSlugField(service?.slug ?? "");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(service?.name ?? "");
      setDescription(service?.description ?? "");
      setStatus(service?.status ?? "active");
      slugField.reset(service?.slug ?? "");
    }
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    const payload = { name: name.trim(), slug: slugField.slug, description, status };
    startTransition(async () => {
      try {
        if (isEdit && service) {
          await updateService(service.id, payload);
          toast.success("Service updated successfully.");
        } else {
          await createService(payload);
          toast.success("Service created successfully.");
        }
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>
            Services are attached to businesses and used for search & filtering.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Service Name</Label>
            <Input
              id="svc-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                slugField.onNameChange(e.target.value);
              }}
              placeholder="e.g. Root Canal Treatment"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-slug">Slug</Label>
            <Input
              id="svc-slug"
              value={slugField.slug}
              onChange={(e) => slugField.onSlugChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-description">Description</Label>
            <Textarea
              id="svc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description shown to customers."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ServiceStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending}>
            {isEdit ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
