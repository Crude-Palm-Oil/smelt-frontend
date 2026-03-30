export const APP_NAME = "CertGuard";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  SCAN: "/scan",
  RESULTS: "/results",
  REPORTS: "/reports",
  CONFIGURATION: "/configuration",
  MONITORING: "/monitoring",
} as const;

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { id: "scan", label: "Scan", href: ROUTES.SCAN, icon: "Search" },
  { id: "results", label: "Results", href: ROUTES.RESULTS, icon: "FileText" },
  { id: "reports", label: "Reports", href: ROUTES.REPORTS, icon: "FileBarChart" },
  { id: "config", label: "Configuration", href: ROUTES.CONFIGURATION, icon: "Settings" },
  { id: "monitoring", label: "Monitoring", href: ROUTES.MONITORING, icon: "Activity" },
] as const;
