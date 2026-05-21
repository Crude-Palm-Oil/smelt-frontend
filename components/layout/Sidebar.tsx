"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import Cookies from "js-cookie";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth");
  };

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-zinc-800 bg-[#0c0c0d] px-4 py-5">
      <div>
        <div className="mb-10">
          <div className="flex items-center gap-3 px-2">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-base font-semibold uppercase tracking-[0.22em] leading-none text-emerald-400">
                {APP_NAME}
              </p>
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.3em] leading-none text-zinc-500">
                TLS · Compliance
              </p>
            </div>
          </div>
          <div className="mx-2 mt-5 h-px bg-gradient-to-r from-emerald-500/40 via-zinc-800 to-transparent" />
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

      <button
        onClick={handleLogout}
        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
      >
        Logout
      </button>
    </aside>
  );
}