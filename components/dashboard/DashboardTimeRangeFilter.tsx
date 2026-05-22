import Link from "next/link";
import type { TimeRange } from "@/lib/server/dashboard";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "All Time", value: "all" },
  { label: "7D", value: "7d" },
  { label: "Fortnight", value: "14d" },
  { label: "Month", value: "30d" },
  { label: "Year", value: "1y" },
];

export default function DashboardTimeRangeFilter({
  activeRange,
}: {
  activeRange: TimeRange;
}) {
  return (
    <div className="flex items-center gap-3">
      <p className="hidden text-xs uppercase tracking-[0.2em] text-zinc-600 sm:block">
        Time Range
      </p>

      <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        {TIME_RANGES.map((item) => {
          const isActive = activeRange === item.value;

          return (
            <Link
              key={item.value}
              href={`/main/dashboard?range=${item.value}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}