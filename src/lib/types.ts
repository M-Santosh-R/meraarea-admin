export type PublishStatus = "published" | "draft";
export type AreaType = "country" | "state" | "city" | "locality";
export type ServiceStatus = "active" | "inactive";
export type BusinessStatus = "draft" | "published" | "archived";
export type AdminRole = "super_admin" | "admin" | "editor";
export type AdminStatus = "active" | "inactive";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Area {
  id: string;
  name: string;
  slug: string;
  type: AreaType;
  parentId: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  locality: string | null;
  description: string;
  imageUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessImage {
  id: string;
  url: string;
  displayOrder: number;
  isCover: boolean;
}

export interface BusinessHour {
  day: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  areaId: string;
  categoryId: string;
  status: BusinessStatus;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  alternatePhone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  googleMapsUrl: string;
  latitude: number | null;
  longitude: number | null;
  seoTitle: string;
  seoDescription: string;
  featuredHomepage: boolean;
  featuredAreaPage: boolean;
  featuredUntil: string | null;
  isVerified: boolean;
  serviceIds: string[];
  images: BusinessImage[];
  hours: BusinessHour[];
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}
