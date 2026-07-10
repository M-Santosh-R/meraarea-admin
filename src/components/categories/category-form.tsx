"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { DiscardChangesDialog } from "@/components/shared/discard-changes-dialog";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { slugify } from "@/lib/slug";
import { Category, PublishStatus } from "@/lib/types";

const ICON_OPTIONS = [
  "Smile",
  "Hospital",
  "UtensilsCrossed",
  "Pill",
  "BedDouble",
  "Scissors",
  "Landmark",
  "Printer",
  "ShoppingCart",
  "Store",
  "GraduationCap",
  "Wrench",
  "Building2",
  "Car",
  "Dumbbell",
  "Shirt",
];

interface FormState {
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  status: PublishStatus;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  icon: "Store",
  description: "",
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
  displayOrder: 0,
  status: "draft",
};

function categoryToForm(category: Category): FormState {
  return {
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
    imageUrl: category.imageUrl ?? "",
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    displayOrder: category.displayOrder,
    status: category.status,
  };
}

export function CategoryForm({
  mode,
  category: existing,
}: {
  mode: "create" | "edit";
  category?: Category | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(
    existing ? categoryToForm(existing) : EMPTY_FORM
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
        <p className="text-sm font-medium text-foreground">Category not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Go back to the categories list.
        </p>
        <Button variant="outline" onClick={() => router.push("/categories")}>
          <ArrowLeft className="size-4" />
          Back to Categories
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
    router.push("/categories");
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      icon: form.icon,
      description: form.description,
      imageUrl: form.imageUrl || null,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      displayOrder: form.displayOrder,
      status: form.status,
    };
    startTransition(async () => {
      try {
        if (mode === "edit" && existing) {
          await updateCategory(existing.id, payload);
          toast.success("Category updated successfully.");
        } else {
          await createCategory(payload);
          toast.success("Category created successfully.");
        }
        setDirty(false);
        router.push("/categories");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

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
                {mode === "edit" ? existing?.name : "New Category"}
              </h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "edit" ? "Editing existing category" : "Creating a new category"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {mode === "edit" ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Basic Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Dentists"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(v) => update("icon", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <DynamicIcon name={form.icon} className="size-4" />
                      {form.icon}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="flex items-center gap-2">
                        <DynamicIcon name={icon} className="size-4" />
                        {icon}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={form.displayOrder}
                onChange={(e) => update("displayOrder", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-image-url">Image URL</Label>
            <Input
              id="cat-image-url"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Shown on the category&apos;s public card. Leave blank to show the icon only.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">SEO</h3>
          <div className="space-y-1.5">
            <Label htmlFor="cat-seo-title">SEO Title</Label>
            <Input
              id="cat-seo-title"
              value={form.seoTitle}
              onChange={(e) => update("seoTitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-seo-description">SEO Description</Label>
            <Textarea
              id="cat-seo-description"
              rows={2}
              value={form.seoDescription}
              onChange={(e) => update("seoDescription", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground">Status</h3>
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
          router.push("/categories");
        }}
      />
    </div>
  );
}
