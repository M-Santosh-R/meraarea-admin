import {
  LayoutDashboard,
  MapPin,
  Tags,
  ListChecks,
  Building2,
  ShieldCheck,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Areas", href: "/areas", icon: MapPin },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Services", href: "/services", icon: ListChecks },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Admins", href: "/admins", icon: ShieldCheck },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export const SIDEBAR_WIDTH = 260;

export const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const DAY_LABELS_SHORT: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
