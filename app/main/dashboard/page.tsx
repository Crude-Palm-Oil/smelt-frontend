import { Suspense } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentScansTable from "@/components/dashboard/RecentScansTable";
import AlertFeed from "@/components/dashboard/AlertFeed";

export default async function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
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