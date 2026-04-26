"use client";

import { usePathname } from "next/navigation";
import { PAGE_TITLES } from "@/lib/constants";

export default function Topbar() {
  const pathname = usePathname();

  // remove "/main"
  const cleanPath = pathname.replace("/main", "");

  const title = PAGE_TITLES[cleanPath] ?? "Dashboard";

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
      <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
    </div>
  );
}
