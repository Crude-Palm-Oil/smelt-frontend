import Link from "next/link";
import {
  AlertTriangle,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";
import { getAlerts } from "@/lib/server/dashboard";

function getAlertIcon(type: string) {
  if (type === "running") {
    return <LoaderCircle className="text-emerald-400" size={24} />;
  }

  if (type === "warning") {
    return <AlertTriangle className="text-yellow-400" size={24} />;
  }

  return <CircleAlert className="text-red-400" size={24} />;
}

export default async function AlertFeed() {
  const alerts = await getAlerts();

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl tracking-[0.35em] text-zinc-100">
            ALERT FEED
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            Recent alerts from monitored scans
          </p>
        </div>

        <Link
          href="/main/monitoring"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          View monitoring →
        </Link>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm text-zinc-400">No active alerts.</p>
            <p className="mt-2 text-xs text-zinc-600">
              Alerts will appear here when monitored scans need review.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.detail_url || "/main/monitoring"}
              className="flex items-start gap-5 rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-emerald-500/40 hover:bg-zinc-900/40"
            >
              <div className="mt-1">{getAlertIcon(alert.type)}</div>

              <div>
                <p className="text-base leading-6 text-zinc-200">
                  {alert.message}
                </p>
                <p className="mt-4 text-sm text-zinc-500">
                  {alert.time_ago}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}