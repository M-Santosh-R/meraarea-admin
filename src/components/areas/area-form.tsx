"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { DiscardChangesDialog } from "@/components/shared/discard-changes-dialog";
import { createArea, updateArea } from "@/lib/actions/areas";
import { slugify } from "@/lib/slug";
import { Area, AreaType, PublishStatus } from "@/lib/types";

const AREA_TYPES: { value: AreaType; label: string }[] = [
  { value: "country", label: "Country" },
  { value: "state", label: "State" },
  { value: "city", label: "City" },
  { value: "locality", label: "Locality" },
];

interface FormState {
  name: string;
  slug: string;
  type: AreaType;
  country: string;
  state: string;
  city: string;
  locality: string;
  parentId: string | null;
  description: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  status: PublishStatus;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  type: "locality",
  country: "India",
  state: "",
  city: "",
  locality: "",
  parentId: null,
  description: "",
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
  isFeatured: false,
  status: "draft",
};

function areaToForm(area: Area): FormState {
  return {
    name: area.name,
    slug: area.slug,
    type: area.type,
    country: area.country ?? "",
    state: area.state ?? "",
    city: area.city ?? "",
    locality: area.locality ?? "",
    parentId: area.parentId,
    description: area.description,
    imageUrl: area.imageUrl ?? "",
    seoTitle: area.seoTitle,
    seoDescription: area.seoDescription,
    isFeatured: area.isFeatured,
    status: area.status,
  };
}

export function AreaForm({
  mode,
  area: existing,
  areas,
}: {
  mode: "create" | "edit";
  area?: Area | null;
  areas: Area[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(
    existing ? areaToForm(existing) : EMPTY_FORM
  );
  const [dirty, setDirty] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const slugTouchedRef = useRef(Boolean(existing?.slug));

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (mode === "edit" && !existing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-foreground">Area not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Go back to the areas list.
        </p>
        <Button variant="outline" onClick={() => router.push("/areas")}>
          <ArrowLeft className="size-4" />
          Back to Areas
        </Button>
      </div>
    );
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouchedRef.current) {
      setForm((f) => ({ ...f, slug: slugify(name) }));
    }
  }

  function handleSlugChange(value: string) {
    slugTouchedRef.current = true;
    update("slug", slugify(value));
  }

  function handleCancel() {
    if (dirty) {
      setShowDiscard(true);
      return;
    }
    router.push("/areas");
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Area name is required.");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      type: form.type,
      parentId: form.parentId,
      country: form.country || null,
      state: form.state || null,
      city: form.city || null,
      locality: form.locality || null,
      description: form.description,
      imageUrl: form.imageUrl || null,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      isFeatured: form.isFeatured,
      status: form.status,
    };
    startTransition(async () => {
      try {
        if (mode === "edit" && existing) {
          await updateArea(existing.id, payload);
          toast.success("Area updated successfully.");
        } else {
          await createArea(payload);
          toast.success("Area created successfully.");
        }
        setDirty(false);
        router.push("/areas");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  const parentOptions = areas.filter((a) => a.id !== existing?.id);

  return (
    <div className="space-y-6 pb-16">
      <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleCancel} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {mode === "edit" ? existing?.name : "New Area"}
              </h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "edit" ? "Editing existing area" : "Creating a new area"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {mode === "edit" ? "Save Changes" : "Create Area"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Basic Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="area-name">Area Name</Label>
              <Input
                id="area-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Satellite"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area-slug">Slug</Label>
              <Input
                id="area-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="satellite"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v as AreaType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Parent Area</Label>
              <Select
                value={form.parentId ?? "none"}
                onValueChange={(v) => update("parentId", v === "none" ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Location Path</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="area-country">Country</Label>
              <Input
                id="area-country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area-state">State</Label>
              <Input
                id="area-state"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area-city">City</Label>
              <Input
                id="area-city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area-locality">Locality</Label>
              <Input
                id="area-locality"
                value={form.locality}
                onChange={(e) => update("locality", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Description</h3>
          <div className="space-y-1.5">
            <Label htmlFor="area-description">Description</Label>
            <Textarea
              id="area-description"
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="A short description shown on the area's public page."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-image-url">Image URL</Label>
            <Input
              id="area-image-url"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Shown on the area&apos;s public card and hero. Leave blank to show a text-only card.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">SEO</h3>
          <div className="space-y-1.5">
            <Label htmlFor="area-seo-title">SEO Title</Label>
            <Input
              id="area-seo-title"
              value={form.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-seo-description">SEO Description</Label>
            <Textarea
              id="area-seo-description"
              rows={2}
              value={form.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Visibility</h3>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Featured on Homepage</p>
              <p className="text-xs text-muted-foreground">
                Show this area under &quot;Featured Areas&quot;.
              </p>
            </div>
            <Switch checked={form.isFeatured} onCheckedChange={(v) => update("isFeatured", v)} />
          </div>
          <div className="space-y-1.5 sm:w-64">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v as PublishStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </div>

      <DiscardChangesDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          setDirty(false);
          router.push("/areas");
        }}
      />
    </div>
  );
}
