"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { DiscardChangesDialog } from "@/components/shared/discard-changes-dialog";
import { createBusiness, updateBusiness } from "@/lib/actions/businesses";
import { slugify } from "@/lib/slug";
import {
  BUSINESS_TABS,
  BusinessFormState,
  businessToFormState,
  emptyBusinessForm,
} from "@/components/businesses/business-form-types";
import { BasicTab } from "@/components/businesses/tabs/basic-tab";
import { DescriptionTab } from "@/components/businesses/tabs/description-tab";
import { ContactTab } from "@/components/businesses/tabs/contact-tab";
import { AddressTab } from "@/components/businesses/tabs/address-tab";
import { ServicesTab } from "@/components/businesses/tabs/services-tab";
import { ImagesTab } from "@/components/businesses/tabs/images-tab";
import { HoursTab } from "@/components/businesses/tabs/hours-tab";
import { SeoTab } from "@/components/businesses/tabs/seo-tab";
import { VisibilityTab } from "@/components/businesses/tabs/visibility-tab";
import { Area, Business, Category, Service } from "@/lib/types";

export function BusinessForm({
  mode,
  business: existing,
  areas,
  categories,
  services,
  currentAdminId,
}: {
  mode: "create" | "edit";
  business?: Business | null;
  areas: Area[];
  categories: Category[];
  services: Service[];
  currentAdminId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<BusinessFormState>(
    existing ? businessToFormState(existing) : emptyBusinessForm()
  );
  const [activeTab, setActiveTab] = useState<string>(BUSINESS_TABS[0].value);
  const [dirty, setDirty] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const slugTouchedRef = useRef(Boolean(existing?.slug));

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (mode === "edit" && !existing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-foreground">Business not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Go back to the businesses list.
        </p>
        <Button variant="outline" onClick={() => router.push("/businesses")}>
          <ArrowLeft className="size-4" />
          Back to Businesses
        </Button>
      </div>
    );
  }

  function updateForm(patch: Partial<BusinessFormState>) {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }

  function handleNameChange(name: string) {
    if (!slugTouchedRef.current) {
      setForm((f) => ({ ...f, slug: slugify(name) }));
    }
  }

  function handleSlugTouch() {
    slugTouchedRef.current = true;
  }

  function handleCancel() {
    if (dirty) {
      setShowDiscard(true);
      return;
    }
    router.push("/businesses");
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Business name is required.");
      setActiveTab("basic");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required.");
      setActiveTab("basic");
      return;
    }
    if (!form.areaId || !form.categoryId) {
      toast.error("Area and Category are required.");
      setActiveTab("basic");
      return;
    }

    const payload = form;

    startTransition(async () => {
      try {
        if (mode === "edit" && existing) {
          await updateBusiness(existing.id, payload);
          toast.success("Business updated successfully.");
        } else {
          await createBusiness({ ...payload, createdById: currentAdminId });
          toast.success("Business created successfully.");
        }
        setDirty(false);
        router.push("/businesses");
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
                {mode === "edit" ? existing?.name : "New Business"}
              </h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "edit" ? "Editing existing listing" : "Creating a new listing"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {mode === "edit" ? "Save Changes" : "Create Business"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {BUSINESS_TABS.map((tab, i) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg border border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <span className="mr-1.5 text-xs text-muted-foreground">{i + 1}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <TabsContent value="basic" className="mt-0">
            <BasicTab
              value={form}
              onChange={updateForm}
              onNameChange={handleNameChange}
              onSlugTouch={handleSlugTouch}
              areas={areas}
              categories={categories}
            />
          </TabsContent>
          <TabsContent value="description" className="mt-0">
            <DescriptionTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="contact" className="mt-0">
            <ContactTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="address" className="mt-0">
            <AddressTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="services" className="mt-0">
            <ServicesTab value={form} onChange={updateForm} services={services} />
          </TabsContent>
          <TabsContent value="images" className="mt-0">
            <ImagesTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="hours" className="mt-0">
            <HoursTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="seo" className="mt-0">
            <SeoTab value={form} onChange={updateForm} />
          </TabsContent>
          <TabsContent value="visibility" className="mt-0">
            <VisibilityTab value={form} onChange={updateForm} />
          </TabsContent>
        </div>
      </Tabs>

      <DiscardChangesDialog
        open={showDiscard}
        onOpenChange={setShowDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          setDirty(false);
          router.push("/businesses");
        }}
      />
    </div>
  );
}
