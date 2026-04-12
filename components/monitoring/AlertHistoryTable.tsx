import { alertHistory, AlertType, AlertStatus } from "@/lib/mock-monitoring-data";

function typeBadge(type: AlertType) {
  if (type === "FAIL") return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400";
  if (type === "PASS") return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400";
  return                      "rounded px-2 py-0.5 text-xs font-mono font-medium bg-yellow-500/10 text-yellow-400";
}

function statusBadge(status: AlertStatus) {
  if (status === "NEW") return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400";
  return                      "rounded px-2 py-0.5 text-xs font-mono font-medium bg-zinc-800 text-zinc-400";
}

export default function AlertHistoryTable() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Alert History
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Recent alerts from monitored domains
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Domain</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {alertHistory.map((row, i) => (
              <tr
                key={i}
                className="border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
              >
                <td className="px-5 py-4 font-mono text-zinc-200">{row.domain}</td>
                <td className="px-5 py-4">
                  <span className={typeBadge(row.type)}>{row.type}</span>
                </td>
                <td className="px-5 py-4 text-zinc-400">{row.message}</td>
                <td className="px-5 py-4 text-zinc-400">{row.time}</td>
                <td className="px-5 py-4">
                  <span className={statusBadge(row.status)}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
