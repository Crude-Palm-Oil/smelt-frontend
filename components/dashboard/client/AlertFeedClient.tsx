"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CircleAlert,
  LoaderCircle,
  ChevronRight,
  X,
} from "lucide-react";
import type { DashboardAlert } from "@/lib/server/dashboard";

const SHOW_OPTIONS = [5, 10, 20, 50];
const DISMISSED_ALERTS_KEY = "smelt-dismissed-alerts";

function AlertIcon({ type }: { type: string }) {
  if (type === "running") {
    return (
      <span className="rounded-md bg-sky-500/10 p-1.5 text-sky-400">
        <LoaderCircle size={14} />
      </span>
    );
  }

  if (type === "warning") {
    return (
      <span className="rounded-md bg-amber-500/10 p-1.5 text-amber-400">
        <AlertTriangle size={14} />
      </span>
    );
  }

  return (
    <span className="rounded-md bg-red-500/10 p-1.5 text-red-400">
      <CircleAlert size={14} />
    </span>
  );
}

function loadDismissedAlertIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const stored = window.localStorage.getItem(DISMISSED_ALERTS_KEY);

    if (!stored) {
      return new Set<string>();
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.map(String));
  } catch {
    return new Set<string>();
  }
}

function saveDismissedAlertIds(ids: Set<string>) {
  window.localStorage.setItem(
    DISMISSED_ALERTS_KEY,
    JSON.stringify(Array.from(ids))
  );
}

export default function AlertFeedClient({
  alerts,
}: {
  alerts: DashboardAlert[];
}) {
  const [showCount, setShowCount] = useState(5);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setDismissedAlertIds(loadDismissedAlertIds());
  }, []);

  const activeAlerts = useMemo(() => {
    return alerts.filter((alert) => !dismissedAlertIds.has(alert.id));
  }, [alerts, dismissedAlertIds]);

  const visibleAlerts = activeAlerts.slice(0, showCount);

  function dismissAlert(alertId: string) {
    setDismissedAlertIds((previous) => {
      const next = new Set(previous);
      next.add(alertId);
      saveDismissedAlertIds(next);
      return next;
    });
  }

  function clearDismissedAlerts() {
    const empty = new Set<string>();
    saveDismissedAlertIds(empty);
    setDismissedAlertIds(empty);
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
            Alert Feed
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Showing {visibleAlerts.length} of {activeAlerts.length} active alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dismissedAlertIds.size > 0 && (
            <button
              type="button"
              onClick={clearDismissedAlerts}
              className="font-mono text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              Restore dismissed
            </button>
          )}

          <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Show
          </label>

          <select
            value={showCount}
            onChange={(event) => setShowCount(Number(event.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-300 outline-none transition hover:border-zinc-700 focus:border-zinc-600"
          >
            {SHOW_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Link
            href="/main/monitoring"
            className="font-mono text-xs text-emerald-400 transition hover:text-emerald-300"
          >
            View monitoring →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        {visibleAlerts.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-mono text-xs text-zinc-600">No active alerts</p>

            {dismissedAlertIds.size > 0 && (
              <button
                type="button"
                onClick={clearDismissedAlerts}
                className="mt-3 font-mono text-xs text-emerald-400 transition hover:text-emerald-300"
              >
                Restore dismissed alerts
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className="group grid grid-cols-[28px_1fr_20px_24px] items-start gap-4 px-5 py-4 transition hover:bg-zinc-900/40"
              >
                <AlertIcon type={alert.type} />

                <Link
                  href={alert.detail_url || "/main/monitoring"}
                  className="min-w-0"
                >
                  <p className="text-sm leading-5 text-zinc-300">
                    {alert.message}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-zinc-600">
                    {alert.time_ago}
                  </p>
                </Link>

                <Link
                  href={alert.detail_url || "/main/monitoring"}
                  className="mt-1 text-zinc-600 transition group-hover:text-emerald-400"
                >
                  <ChevronRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="mt-0.5 rounded-md p-1 text-zinc-700 transition hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="Dismiss alert"
                  title="Dismiss alert"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}