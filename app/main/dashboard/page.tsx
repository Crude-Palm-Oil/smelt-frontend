import { Suspense } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentScansTable from "@/components/dashboard/RecentScansTable";
import AlertFeed from "@/components/dashboard/AlertFeed";
import DashboardTimeRangeFilter from "@/components/dashboard/DashboardTimeRangeFilter";
import type { TimeRange } from "@/lib/server/dashboard";

function getValidRange(value?: string): TimeRange {
  if (
    value === "7d" ||
    value === "14d" ||
    value === "30d" ||
    value === "1y" ||
    value === "all"
  ) {
    return value;
  }

  return "all";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = getValidRange(params.range);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-100">
            TLS Compliance Overview
          </h1>
        </div>

        <DashboardTimeRangeFilter activeRange={range} />
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards range={range} />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Suspense fallback={<PanelSkeleton />}>
          <RecentScansTable />
        </Suspense>

        <Suspense fallback={<PanelSkeleton />}>
          <AlertFeed />
        </Suspense>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[112px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
        />
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <section>
      <div className="mb-4">
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-zinc-900" />
      </div>

      <div className="h-72 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
    </section>
  );
}