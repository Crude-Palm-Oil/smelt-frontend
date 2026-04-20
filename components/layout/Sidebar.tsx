"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-zinc-800 bg-[#0c0c0d] px-4 py-5">
      <div>
        <div className="mb-10 px-2">
          <p className="text-lg font-semibold tracking-widest text-emerald-400">{APP_NAME}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">TLS Compliance</p>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const href = `/main${item.href}`;
            const isActive = pathname === href;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}