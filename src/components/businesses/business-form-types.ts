import { Business, BusinessHour } from "@/lib/types";

export type BusinessFormState = Omit<Business, "id" | "createdAt" | "updatedAt" | "createdById">;

const DAYS: BusinessHour["day"][] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function defaultHours(): BusinessHour[] {
  return DAYS.map((day) => ({
    day,
    openTime: "10:00",
    closeTime: "20:00",
    isClosed: day === "sunday",
  }));
}

export function emptyBusinessForm(): BusinessFormState {
  return {
    name: "",
    slug: "",
    areaId: "",
    categoryId: "",
    status: "draft",
    shortDescription: "",
    fullDescription: "",
    phone: "",
    alternatePhone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    googleMapsUrl: "",
    latitude: null,
    longitude: null,
    seoTitle: "",
    seoDescription: "",
    featuredHomepage: false,
    featuredAreaPage: false,
    featuredUntil: null,
    isVerified: false,
    serviceIds: [],
    images: [],
    hours: defaultHours(),
  };
}

export function businessToFormState(business: Business): BusinessFormState {
  const { id, createdAt, updatedAt, createdById, ...rest } = business;
  void id;
  void createdAt;
  void updatedAt;
  void createdById;
  return rest;
}

export const BUSINESS_TABS = [
  { value: "basic", label: "Basic" },
  { value: "description", label: "Description" },
  { value: "contact", label: "Contact" },
  { value: "address", label: "Address" },
  { value: "services", label: "Services" },
  { value: "images", label: "Images" },
  { value: "hours", label: "Business Hours" },
  { value: "seo", label: "SEO" },
  { value: "visibility", label: "Visibility" },
] as const;
