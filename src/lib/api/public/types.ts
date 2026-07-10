export interface AreaBreadcrumbEntry {
  id: string;
  name: string;
  slug: string;
}

export interface AreaSummary {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string | null;
  state: string | null;
  isFeatured: boolean;
  businessCount: number;
  imageUrl: string | null;
}

export interface AreaDetail extends AreaSummary {
  description: string;
  seoTitle: string;
  seoDescription: string;
  breadcrumb: AreaBreadcrumbEntry[];
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
  businessCount: number;
  imageUrl: string | null;
}

export interface CategoryDetail extends CategorySummary {
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface BusinessCard {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  address: string;
  coverImageUrl: string | null;
  featuredHomepage: boolean;
  featuredAreaPage: boolean;
  isVerified: boolean;
  phone: string;
  whatsapp: string;
  area: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
}

export interface BusinessHourEntry {
  day: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface BusinessImageEntry {
  url: string;
  displayOrder: number;
  isCover: boolean;
}

export interface BusinessServiceEntry {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface BusinessDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  isVerified: boolean;
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
  area: { id: string; name: string; slug: string; breadcrumb: AreaBreadcrumbEntry[] };
  category: { id: string; name: string; slug: string };
  images: BusinessImageEntry[];
  hours: BusinessHourEntry[];
  services: BusinessServiceEntry[];
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface BusinessSitemapEntry {
  areaSlug: string;
  slug: string;
  updatedAt: string;
}

export interface HomeStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  totalAreas: number;
  totalCategories: number;
}

export interface SearchResponse {
  query: string;
  businesses: BusinessCard[];
  categories: CategorySummary[];
  areas: AreaSummary[];
}
