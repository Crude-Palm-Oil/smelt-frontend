type ComplianceItem = {
  label: string;
  value: number;
};

async function getComplianceOverview(): Promise<ComplianceItem[]> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const res = await fetch(`${apiBaseUrl}/api/dashboard/compliance-overview`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch compliance overview");
  }

  return res.json();
}

function getColor(value: number) {
  if (value < 50) return "bg-red-400";
  if (value < 80) return "bg-amber-400";
  return "bg-emerald-400";
}

export default async function ComplianceOverview() {
  const items = await getComplianceOverview();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-4 text-sm text-zinc-400">Compliance Overview</h2>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-5">
            <p className="text-sm text-zinc-400">
              No compliance data available.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Overview will appear after scan results are processed.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const safeValue = Math.max(0, Math.min(item.value, 100));
            const barColor = getColor(safeValue);

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="text-xs text-zinc-400">{safeValue}%</p>
                </div>

                <div className="mt-1 h-2 rounded bg-zinc-800">
                  <div
                    className={`h-2 rounded ${barColor}`}
                    style={{ width: `${safeValue}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}