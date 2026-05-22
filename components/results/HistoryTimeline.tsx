"use client";

import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
} from "lucide-react";
import type { HistoryItem, LintStatus } from "@/lib/mock-results-data";
import { timeAgo } from "@/lib/utils";

// Shared vertical timeline used by both the target-history and
// certificate-history detail pages. Each row represents one scan that
// touched this entity, with a coloured dot for the worst status that
// scan produced and a link out to the canonical scan-detail page.

function statusVisual(status: LintStatus): {
  dot: string;
  badge: string;
  Icon: typeof CheckCircle2;
  label: string;
} {
  switch (status) {
    case "fatal":
      return {
        dot: "bg-fuchsia-500",
        badge: "bg-fuchsia-500/10 text-fuchsia-400",
        Icon: AlertOctagon,
        label: "FATAL",
      };
    case "fail":
      return {
        dot: "bg-red-500",
        badge: "bg-red-500/10 text-red-400",
        Icon: XCircle,
        label: "FAIL",
      };
    case "warn":
      return {
        dot: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-400",
        Icon: AlertTriangle,
        label: "WARN",
      };
    case "info":
      return {
        dot: "bg-sky-500",
        badge: "bg-sky-500/10 text-sky-400",
        Icon: Info,
        label: "INFO",
      };
    default:
      return {
        dot: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-400",
        Icon: CheckCircle2,
        label: "PASS",
      };
  }
}

export default function HistoryTimeline({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-12 text-center">
        <p className="font-mono text-xs text-zinc-600">
          No scans recorded for this entity yet.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {/* Vertical guide line behind the dots */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800"
      />
      {items.map((item, idx) => {
        const v = statusVisual(item.status as LintStatus);
        const Icon = v.Icon;
        return (
          <li
            key={item.lintId}
            className="relative flex items-start gap-4 pl-6"
          >
            {/* Dot anchored on the guide line */}
            <span
              className={`absolute left-0 top-3 inline-flex h-3.5 w-3.5 rounded-full border-2 border-zinc-950 ${v.dot}`}
              aria-hidden
            />
            <Link
              href={`/main/results/scan/${item.scanId}?lint=${item.lintId}`}
              className={`group my-1 flex flex-1 items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-900/60 ${
                idx === 0 ? "ring-1 ring-inset ring-emerald-500/10" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium ${v.badge}`}
                  >
                    <Icon size={11} /> {v.label}
                  </span>
                  <span className="font-mono text-sm text-zinc-200 truncate">
                    {item.scanName}
                  </span>
                  {idx === 0 && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-widest text-emerald-400">
                      Latest
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 font-mono text-[11px] text-zinc-500"
                  title={item.scannedAt}
                >
                  {timeAgo(item.scannedAt)} ·{" "}
                  {new Date(item.scannedAt).toLocaleString()}
                </p>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 text-zinc-600 transition group-hover:text-zinc-400"
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
