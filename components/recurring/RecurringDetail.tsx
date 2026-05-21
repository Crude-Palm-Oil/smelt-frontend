"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Repeat,
  Calendar,
  Hash,
  Save,
  Plus,
  Trash2,
  Globe,
  Shield,
  FileCode,
  AlertTriangle,
} from "lucide-react";
import type {
  RecurringScanDetail,
  RecurringTarget,
} from "@/lib/mock-results-data";
import { updateRecurringScan } from "@/services/api";
import { timeAgo } from "@/lib/utils";

// Lightweight cron-expression sanity check. Doesn't try to validate the
// full crontab grammar — just confirms we have 5 whitespace-separated
// fields, since that's what asynq's scheduler expects. The Go side will
// reject genuinely malformed entries when it next syncs, but a clear
// inline warning here prevents the obvious typo case.
function isLikelyValidCron(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length === 5 && parts.every((p) => p.length > 0);
}

// Human-readable hint for the most common cron forms. Falls back to
// "custom" for anything we don't recognise. Frontend-only — purely cosmetic.
function cronHint(value: string): string {
  const v = value.trim();
  const map: Record<string, string> = {
    "* * * * *": "every minute",
    "0 * * * *": "every hour",
    "0 0 * * *": "daily at midnight",
    "0 0 * * 0": "weekly on Sunday",
    "0 0 1 * *": "monthly on the 1st",
    "*/5 * * * *": "every 5 minutes",
    "*/15 * * * *": "every 15 minutes",
    "*/30 * * * *": "every 30 minutes",
    "0 */6 * * *": "every 6 hours",
    "0 */12 * * *": "every 12 hours",
  };
  return map[v] ?? "custom schedule";
}

function StatusPill({ status }: { status: string }) {
  const lower = status.toLowerCase();
  if (lower === "fatal" || lower === "error" || lower === "fail")
    return (
      <span className="rounded bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] text-red-400">
        {status.toUpperCase()}
      </span>
    );
  if (lower === "warn")
    return (
      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
        WARN
      </span>
    );
  if (lower === "running" || lower === "paused")
    return (
      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-400">
        {status.toUpperCase()}
      </span>
    );
  return (
    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
      {status.toUpperCase()}
    </span>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p
        className="mt-1 truncate font-mono text-xs text-zinc-200"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export default function RecurringDetail({
  detail,
}: {
  detail: RecurringScanDetail;
}) {
  const router = useRouter();
  const [name, setName] = useState(detail.name);
  const [cron, setCron] = useState(detail.cron);
  // Targets state holds a working copy that the user edits in place. We
  // only send the array on save when type === "target" (cert lists are
  // read-only here — user would delete + recreate from the scan page).
  const [targets, setTargets] = useState<RecurringTarget[]>(
    detail.targets ?? [],
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cronValid = isLikelyValidCron(cron);
  const cronHumanised = cronHint(cron);
  const isTargetType = detail.type === "target";

  const dirty =
    name !== detail.name ||
    cron !== detail.cron ||
    (isTargetType &&
      JSON.stringify(targets) !== JSON.stringify(detail.targets ?? []));

  const updateTarget = (idx: number, patch: Partial<RecurringTarget>) => {
    setTargets((prev: RecurringTarget[]) =>
      prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    );
  };

  const removeTarget = (idx: number) => {
    setTargets((prev: RecurringTarget[]) => prev.filter((_, i) => i !== idx));
  };

  const addTarget = () => {
    setTargets((prev: RecurringTarget[]) => [
      ...prev,
      { hostname: "", ipAddress: null, port: 443 },
    ]);
  };

  const onSave = () => {
    if (!cronValid) {
      setSaveError("Cron must have 5 whitespace-separated fields.");
      return;
    }
    setSaveError(null);
    startTransition(async () => {
      const res = await updateRecurringScan(detail.id, {
        name: name !== detail.name ? name : undefined,
        cron: cron !== detail.cron ? cron : undefined,
        targets:
          isTargetType &&
          JSON.stringify(targets) !== JSON.stringify(detail.targets ?? [])
            ? targets
            : undefined,
      });
      if (res.ok) {
        router.refresh();
      } else {
        setSaveError(
          `Save failed (${res.status}): ${res.message ?? "unknown error"}`,
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <nav className="flex items-center gap-2 font-mono text-xs">
        <Link
          href="/main/recurring"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft size={12} />
          Back
        </Link>
        <span className="text-zinc-700">/</span>
        <Link
          href="/main/recurring"
          className="text-zinc-500 transition hover:text-zinc-300"
        >
          Recurring
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="truncate text-zinc-300">{detail.name}</span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 font-mono text-2xl font-semibold text-zinc-100">
              <Repeat size={20} className="text-emerald-400" />
              <span className="truncate">{detail.name}</span>
            </h1>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">
              {detail.id}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaCard
            icon={<FileCode size={12} />}
            label="Type"
            value={
              detail.type === "target"
                ? "Target scan"
                : detail.type === "file"
                  ? "Certificate scan"
                  : "Unknown"
            }
          />
          <MetaCard
            icon={<Hash size={12} />}
            label="Runs"
            value={String(detail.runCount)}
          />
          <MetaCard
            icon={<Calendar size={12} />}
            label="Last Run"
            value={
              detail.lastRunAt
                ? new Date(detail.lastRunAt).toLocaleString()
                : "Never"
            }
          />
          <MetaCard
            icon={<Repeat size={12} />}
            label="Schedule"
            value={cronHumanised}
          />
        </div>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Edit
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-200 outline-none transition focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Cron expression
            </label>
            <input
              type="text"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className={`mt-1 w-full rounded-lg border bg-zinc-900/50 px-3 py-2 font-mono text-sm text-zinc-200 outline-none transition focus:border-zinc-600 ${
                cron && !cronValid ? "border-amber-500/50" : "border-zinc-800"
              }`}
              placeholder="0 */6 * * *"
            />
            <p
              className={`mt-1 font-mono text-[10px] ${
                cron && !cronValid ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              {cron && !cronValid
                ? "Expected 5 fields separated by spaces (minute hour dom month dow)"
                : `${cronHumanised} · 5-field crontab syntax`}
            </p>
          </div>

          {isTargetType && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Targets ({targets.length})
                </label>
                <button
                  onClick={addTarget}
                  className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-[10px] font-mono text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
                >
                  <Plus size={11} />
                  Add target
                </button>
              </div>

              <div className="space-y-2">
                {targets.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center font-mono text-xs text-zinc-600">
                    No targets — add at least one to keep this schedule
                    runnable.
                  </p>
                ) : (
                  targets.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2"
                    >
                      <Globe size={12} className="shrink-0 text-zinc-600" />
                      <input
                        type="text"
                        value={t.hostname ?? ""}
                        onChange={(e) =>
                          updateTarget(idx, {
                            hostname: e.target.value || null,
                          })
                        }
                        placeholder="hostname"
                        className="min-w-0 flex-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600"
                      />
                      <input
                        type="text"
                        value={t.ipAddress ?? ""}
                        onChange={(e) =>
                          updateTarget(idx, {
                            ipAddress: e.target.value || null,
                          })
                        }
                        placeholder="ip"
                        className="w-32 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600"
                      />
                      <input
                        type="number"
                        value={t.port}
                        onChange={(e) =>
                          updateTarget(idx, {
                            port: Number(e.target.value) || 0,
                          })
                        }
                        min={1}
                        max={65535}
                        className="w-20 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600"
                      />
                      <button
                        onClick={() => removeTarget(idx)}
                        className="text-zinc-500 transition hover:text-red-400"
                        title="Remove target"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {detail.type === "file" && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Certificates ({detail.certificateIds?.length ?? 0})
              </label>
              <p className="mt-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 font-mono text-[11px] text-zinc-500">
                <Shield size={11} className="mr-1 inline" />
                Cert lists are read-only here. Delete this schedule and
                re-create from the Scan page to change the cert set.
              </p>
            </div>
          )}

          {saveError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
              <AlertTriangle
                size={12}
                className="mt-0.5 shrink-0 text-red-400"
              />
              <p className="font-mono text-xs text-red-300">{saveError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onSave}
              disabled={!dirty || pending || !cronValid}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-mono text-emerald-300 transition hover:border-emerald-500/60 hover:bg-emerald-500/20 disabled:opacity-40 disabled:hover:border-emerald-500/30 disabled:hover:bg-emerald-500/10"
            >
              <Save size={12} />
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Run History
        </h2>

        {detail.history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center">
            <p className="font-mono text-xs text-zinc-600">
              No runs yet — this schedule hasn&rsquo;t fired.
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {detail.history.map((run) => (
              <li key={run.scanId}>
                <Link
                  href={`/main/results/scan/${run.scanId}`}
                  className="group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-900/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-zinc-200 truncate">
                        {run.name}
                      </span>
                      <StatusPill status={run.status} />
                    </div>
                    <p
                      className="mt-1 font-mono text-[11px] text-zinc-500"
                      title={run.scannedAt}
                    >
                      {timeAgo(run.scannedAt)} ·{" "}
                      {new Date(run.scannedAt).toLocaleString()} ·{" "}
                      {run.targetCount} target
                      {run.targetCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
