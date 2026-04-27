import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { finishedScans } from "@/lib/mock-results-data"; 

// TODO: Change Fail to Error Due to LINTS
function getScanStatus(scan: {
  lintsWarn: number;
  lintsFail: number;
  lintsFatal: number;
}) {
  if (scan.lintsFatal > 0) return "FATAL";
  if (scan.lintsFail > 0) return "FAIL";
  if (scan.lintsWarn > 0) return "WARN";
  return "PASS";
}

function formatDate(scannedAt: string) {
  const date = new Date(scannedAt);

  return date
    .toISOString()
    .replace("T", "\n")
    .slice(0, 16);
}

export default function RecentScansTable() {
  const recentScans = [...finishedScans]
    .sort(
      (a, b) =>
        new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl tracking-[0.2em] text-zinc-100">
            RECENT SCANS
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            Most recent compliance scans
          </p>
        </div>

        <Link
          href="/main/results"
          className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_1fr] border-b border-zinc-800 bg-zinc-900/50 px-8 py-6 text-sm tracking-[0.2em] text-zinc-500">
          <p>NAME</p>
          <p>STATUS</p>
          <p>TARGETS</p>
          <p>ISSUES</p>
          <p>DATE</p>
        </div>

        {recentScans.map((scan) => {
          const status = getScanStatus(scan);
          const issueCount =
            scan.lintsInfo + scan.lintsWarn + scan.lintsFail + scan.lintsFatal;

          return (
            <Link
              key={scan.id}
              href={`/main/results/${scan.id}`}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_1fr] items-center border-b border-zinc-800 px-8 py-7 text-sm transition last:border-b-0 hover:bg-zinc-900/60"
            >
              <div>
                <p className="text-cyan-400">{scan.name}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {scan.id.slice(0, 8)}
                </p>
              </div>

              <div>
                <Badge variant={status}>{status}</Badge>
              </div>

              <p className="text-zinc-300">{scan.targetCount}</p>

              <p className={issueCount > 0 ? "text-red-400" : "text-zinc-500"}>
                {issueCount}
              </p>

              <p className="whitespace-pre-line text-zinc-500">
                {formatDate(scan.scannedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}