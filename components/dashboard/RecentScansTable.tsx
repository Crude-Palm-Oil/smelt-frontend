import Badge from "@/components/ui/badge/Badge";

type RecentScan = {
  domain: string;
  status: "PASS" | "FAIL" | "WARN";
  certs: number;
  issues: number;
  date: string;
};

const recentScans: RecentScan[] = [
  { domain: "api.example.com", status: "PASS", certs: 3, issues: 0, date: "2026-03-28\n14:32" },
  { domain: "mail.corp.internal", status: "FAIL", certs: 2, issues: 4, date: "2026-03-28\n11:05" },
  { domain: "cdn.platform.io", status: "WARN", certs: 5, issues: 2, date: "2026-03-27\n09:18" },
  { domain: "auth.service.net", status: "PASS", certs: 1, issues: 0, date: "2026-03-26\n16:44" },
  { domain: "legacy.internal.org", status: "FAIL", certs: 4, issues: 7, date: "2026-03-25\n08:11" },
];

export default function RecentScansTable() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl tracking-[0.2em] text-zinc-100">RECENT SCANS</h2>
        <p className="mt-4 text-sm text-zinc-500">Most recent compliance scans</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_1fr] border-b border-zinc-800 bg-zinc-900/50 px-8 py-6 text-sm tracking-[0.2em] text-zinc-500">
          <p>DOMAIN</p>
          <p>STATUS</p>
          <p>CERTS</p>
          <p>ISSUES</p>
          <p>DATE</p>
        </div>

        {recentScans.map((scan) => (
          <div
            key={`${scan.domain}-${scan.date}`}
            className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr_1fr] items-center border-b border-zinc-800 px-8 py-7 text-sm last:border-b-0"
          >
            <p className="text-cyan-400">{scan.domain}</p>

            <div>
              <Badge variant={scan.status}>{scan.status}</Badge>
            </div>

            <p className="text-zinc-300">{scan.certs}</p>

            <p className={scan.issues > 0 ? "text-red-400" : "text-zinc-500"}>
              {scan.issues}
            </p>

            <p className="whitespace-pre-line text-zinc-500">{scan.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}