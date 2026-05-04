import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";

type RecentScan = {
  id: string;
  name: string;
  status: string;
  targets: number;
  issues: number;
  date: string;
  time: string;
};

async function getRecentScans(): Promise<RecentScan[]> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${apiBaseUrl}/api/dashboard/recent-scans`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recent scans");
  }

  return res.json();
}

function normalizeStatus(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "fatal") return "FATAL";
  if (normalizedStatus === "fail" || normalizedStatus === "error") return "FAIL";
  if (normalizedStatus === "warn" || normalizedStatus === "warning") return "WARN";
  if (normalizedStatus === "pass" || normalizedStatus === "success") return "PASS";

  return "WARN";
}

function formatDate(date: string, time: string) {
  if (!date || date === "-") return "-";

  if (!time || time === "-") {
    return date;
  }

  return `${date}\n${time}`;
}

export default async function RecentScansTable() {
  const recentScans = await getRecentScans();

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

        {recentScans.length === 0 ? (
          <div className="px-8 py-10 text-sm text-zinc-500">
            No recent scans found.
          </div>
        ) : (
          recentScans.map((scan) => {
            const status = normalizeStatus(scan.status);

            return (
              <Link
                key={scan.id}
                href={`/main/results/${scan.id}`}
                className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_1fr] items-center border-b border-zinc-800 px-8 py-7 text-sm transition last:border-b-0 hover:bg-zinc-900/60"
              >
                <div>
                  <p className="text-cyan-400">
                    {scan.name || "Unnamed Scan"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {scan.id.slice(0, 8)}
                  </p>
                </div>

                <div>
                  <Badge variant={status}>{status}</Badge>
                </div>

                <p className="text-zinc-300">{scan.targets}</p>

                <p
                  className={
                    scan.issues > 0 ? "text-red-400" : "text-zinc-500"
                  }
                >
                  {scan.issues}
                </p>

                <p className="whitespace-pre-line text-zinc-500">
                  {formatDate(scan.date, scan.time)}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}