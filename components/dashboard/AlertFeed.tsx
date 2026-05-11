import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { getDashboardAlerts } from "@/lib/server/dashboard";

type AlertTone = "success" | "warning" | "error" | "info";

function getAlertTone(type: string): AlertTone {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "failed" || normalizedType === "error") {
    return "error";
  }

  if (normalizedType === "warning" || normalizedType === "warn") {
    return "warning";
  }

  if (normalizedType === "running" || normalizedType === "info") {
    return "info";
  }

  if (normalizedType === "success" || normalizedType === "pass") {
    return "success";
  }

  return "info";
}

function getAlertIcon(tone: AlertTone) {
  switch (tone) {
    case "warning":
      return (
        <AlertTriangle
          size={22}
          className="text-amber-400"
          strokeWidth={2}
        />
      );
    case "error":
      return (
        <AlertCircle size={22} className="text-red-400" strokeWidth={2} />
      );
    case "success":
      return (
        <CheckCircle2
          size={22}
          className="text-emerald-400"
          strokeWidth={2}
        />
      );
    case "info":
      return <Activity size={22} className="text-cyan-400" strokeWidth={2} />;
  }
}

export default async function AlertFeed() {
  const alerts = await getDashboardAlerts();

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
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-8">
            <p className="text-sm text-zinc-400">No recent alerts found.</p>
            <p className="mt-2 text-xs text-zinc-600">
              Alerts will appear here when scans are running or need review.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const tone = getAlertTone(alert.type);

            return (
              <Link
                key={alert.id}
                href="/main/monitoring"
                className="block rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5 transition hover:bg-zinc-900/60"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getAlertIcon(tone)}</div>

                  <div>
                    <p className="text-base leading-relaxed text-zinc-300">
                      {alert.message}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {alert.time_ago}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}