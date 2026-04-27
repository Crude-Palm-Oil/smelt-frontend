import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  allScans,
  failedScans,
  ongoingScans,
} from "@/lib/mock-monitoring-data";

type AlertTone = "success" | "warning" | "error" | "info";

type AlertItem = {
  message: string;
  time: string;
  tone: AlertTone;
};

function getAlertIcon(tone: AlertTone) {
  switch (tone) {
    case "warning":
      return <AlertTriangle size={22} className="text-amber-400" strokeWidth={2} />;
    case "error":
      return <AlertCircle size={22} className="text-red-400" strokeWidth={2} />;
    case "success":
      return <CheckCircle2 size={22} className="text-emerald-400" strokeWidth={2} />;
    case "info":
      return <Activity size={22} className="text-cyan-400" strokeWidth={2} />;
  }
}

function getRelativeTime(scannedAt: string) {
  const scannedDate = new Date(scannedAt.replace(" ", "T"));
  const now = new Date("2026-04-19T10:00:00");
  const diffMs = now.getTime() - scannedDate.getTime();

  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const alerts: AlertItem[] = [
  ...ongoingScans.map((scan) => ({
    message: `Scan running: ${scan.name} using ${scan.config} config`,
    time: `${scan.startedAtOffsetSec}s ago`,
    tone: "info" as const,
  })),

  ...failedScans.map((scan) => ({
    message: `Scan failed: ${scan.name} — ${scan.issues}`,
    time: getRelativeTime(scan.scannedAt),
    tone: "error" as const,
  })),

  ...allScans
    .filter((scan) => scan.status === "pass")
    .slice(0, 2)
    .map((scan) => ({
      message: `Monitoring check passed: ${scan.name}`,
      time: getRelativeTime(scan.scannedAt),
      tone: "success" as const,
    })),
].slice(0, 5);

export default function AlertFeed() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl tracking-[0.2em] text-zinc-100">
            ALERT FEED
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            Recent alerts from monitored scans
          </p>
        </div>

        <Link
          href="/main/monitoring"
          className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          View monitoring →
        </Link>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Link
            key={`${alert.message}-${alert.time}`}
            href="/main/monitoring"
            className="block rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5 transition hover:bg-zinc-900/60"
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">{getAlertIcon(alert.tone)}</div>

              <div>
                <p className="text-base leading-relaxed text-zinc-300">
                  {alert.message}
                </p>
                <p className="mt-2 text-xs text-zinc-500">{alert.time}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}