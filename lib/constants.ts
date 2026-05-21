export const APP_NAME = "Smelt";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  SCAN: "/scan",
  RESULTS: "/results",
  REPORTS: "/reports",
  CONFIGURATION: "/configuration",
  MONITORING: "/monitoring",
} as const;

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.SCAN]: "Scan",
  [ROUTES.RESULTS]: "Results",
  [ROUTES.REPORTS]: "Reports",
[ROUTES.CONFIGURATION]: "Configuration",
  [ROUTES.MONITORING]: "Monitoring",
};

import {
  LayoutDashboard,
  Search,
  FileText,
  FileBarChart,
  Settings,
  LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

// Monitoring was folded into Results (Ongoing Scans widget moved to the
// top of the Scans tab). The /monitoring route still exists as a
// redirect shim — keep the ROUTES constant so any stale references
// resolve to a working URL.
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { id: "scan", label: "Scan", href: ROUTES.SCAN, icon: Search },
  { id: "results", label: "Results", href: ROUTES.RESULTS, icon: FileText },
  { id: "config", label: "Configuration", href: ROUTES.CONFIGURATION, icon: Settings },
];