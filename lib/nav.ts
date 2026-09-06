import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Star, TrendingUp, Search, Settings } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Search", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: Settings },
];
