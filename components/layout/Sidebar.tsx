"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, FileText, Settings, Activity, Clipboard} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { label: "Dashboard", href: "/main/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Scan", href: "/main/scan", icon: <Search size={16} /> },
  { label: "Results", href: "/main/results", icon: <FileText size={16} /> },
  { label: "Configuration", href: "/main/configuration", icon: <Settings size={16} /> },
  { label: "Monitoring", href: "/main/monitoring", icon: <Activity size={16} /> },
  { label: "Reports", href: "/main/reports", icon: <Clipboard size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-zinc-800 bg-[#0c0c0d] px-4 py-5">
      <div>
        <div className="mb-10 px-2">
          <p className="text-lg font-semibold tracking-widest text-emerald-400">
            {APP_NAME}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            TLS Compliance
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
