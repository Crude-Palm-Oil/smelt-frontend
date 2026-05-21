"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Repeat,
  Trash2,
  ChevronRight,
  Search,
  AlertTriangle,
} from "lucide-react";
import type { RecurringScanRow } from "@/lib/mock-results-data";
import { deleteRecurringScan } from "@/services/api";
import { timeAgo } from "@/lib/utils";

// Confirmation modal is inlined here rather than imported from a shared
// component because (a) the project doesn't ship one yet and (b) this is
// the only callsite — no reuse pressure to extract.
function DeleteConfirm({
  open,
  name,
  onCancel,
  onConfirm,
  pending,
}: {
  open: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className="w-[420px] rounded-xl border border-red-500/30 bg-[#0a0a0d] p-5 shadow-[0_0_35px_rgba(248,113,113,0.16)]">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-red-400"
          />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              Delete recurring scan
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              Stop running and remove
              <span className="ml-1 font-mono text-zinc-100">
                &ldquo;{name}&rdquo;
              </span>
              ?
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Past scan runs stay in the Results tab; only the schedule is
              removed. This can&rsquo;t be undone.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-mono text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900/80 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-mono text-red-300 transition hover:border-red-500/60 hover:bg-red-500/20 disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecurringTable({
  initialRows,
}: {
  initialRows: RecurringScanRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<RecurringScanRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<RecurringScanRow | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.cron.toLowerCase().includes(q);
  });

  const onDelete = (row: RecurringScanRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmTarget(row);
  };

  const confirmDelete = () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    startTransition(async () => {
      const res = await deleteRecurringScan(target.id);
      if (res.ok) {
        // Optimistically drop the row instead of waiting for the server
        // refresh — feels snappy and the next router.refresh() reconciles.
        setRows((prev: RecurringScanRow[]) =>
          prev.filter((r) => r.id !== target.id),
        );
        setConfirmTarget(null);
        router.refresh();
      } else {
        alert(`Delete failed (${res.status}): ${res.message ?? "unknown"}`);
        setConfirmTarget(null);
      }
    });
  };

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Repeat size={14} className="text-emerald-400" />
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Recurring Scans
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Scheduled runs · click a row to edit or view past runs
          </p>
        </div>
      </div>

      <div className="mb-3 flex justify-end">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            placeholder="Search name or cron..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600 sm:w-72"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Cron</th>
              <th className="px-5 py-3">Runs</th>
              <th className="px-5 py-3">Last Run</th>
              <th className="px-5 py-3 w-20 text-right">Actions</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-zinc-600"
                >
                  {rows.length === 0
                    ? "No recurring scans yet — create one from the Scan page by entering a cron expression."
                    : `No recurring scans match "${query}"`}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/main/recurring/${row.id}`)}
                  className="cursor-pointer border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p
                      className="font-mono text-zinc-200 truncate max-w-[320px]"
                      title={row.name}
                    >
                      {row.name}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400 truncate max-w-[200px]">
                    {row.cron}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-300">
                    {row.runCount}
                  </td>
                  <td className="px-5 py-4 text-zinc-400" title={row.lastRunAt ?? ""}>
                    {row.lastRunAt ? timeAgo(row.lastRunAt) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => onDelete(row, e)}
                      className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                      title="Delete schedule"
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirm
        open={confirmTarget !== null}
        name={confirmTarget?.name ?? ""}
        pending={pending}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
