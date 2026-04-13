import { RefreshCw, Settings, Trash2, Plus } from "lucide-react";
import Button from "@/components/ui/buttons/Button";
import { monitoredDomains, MonitorStatus, MonitorInterval } from "@/lib/mock-monitoring-data";

function intervalBadge(_interval: MonitorInterval) {
  return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-zinc-800 text-zinc-300";
}

function statusBadge(status: MonitorStatus) {
  if (status === "HEALTHY") return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400";
  if (status === "ALERT")   return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400";
  return                           "rounded px-2 py-0.5 text-xs font-mono font-medium bg-yellow-500/10 text-yellow-400";
}

export default function MonitoringTable() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Monitoring
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Automated periodic compliance monitoring
          </p>
        </div>

        <Button>
          <div className="flex items-center gap-2">
            <Plus size={14} />
            <span>Add Domain</span>
          </div>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Domain</th>
              <th className="px-5 py-3">Interval</th>
              <th className="px-5 py-3">Last Check</th>
              <th className="px-5 py-3">Next Check</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Alerts</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitoredDomains.map((row) => (
              <tr
                key={row.domain}
                className="border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
              >
                <td className="px-5 py-4 font-mono text-zinc-200">{row.domain}</td>
                <td className="px-5 py-4">
                  <span className={intervalBadge(row.interval)}>{row.interval}</span>
                </td>
                <td className="px-5 py-4 text-zinc-400">{row.lastCheck}</td>
                <td className="px-5 py-4 text-zinc-400">{row.nextCheck}</td>
                <td className="px-5 py-4">
                  <span className={statusBadge(row.status)}>{row.status}</span>
                </td>
                <td className="px-5 py-4 text-zinc-400">{row.alerts}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <button className="transition hover:text-zinc-200"><RefreshCw size={14} /></button>
                    <button className="transition hover:text-zinc-200"><Settings size={14} /></button>
                    <button className="transition hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
