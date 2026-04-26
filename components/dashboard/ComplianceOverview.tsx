const items = [
  { label: "Key Size", value: 96 },
  { label: "Signature Algorithm", value: 88 },
  { label: "Validity Period", value: 72 },
  { label: "SAN Format", value: 20 },
  { label: "CT Requirement", value: 72 },
];

function getColor(value: number) {
  if (value < 50) return "bg-red-400";
  if (value < 80) return "bg-amber-400";
  return "bg-emerald-400";
}

export default function ComplianceOverview() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-4 text-sm text-zinc-400">Compliance Overview</h2>

      <div className="space-y-4">
        {items.map((item) => {
          const barColor = getColor(item.value);

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="text-xs text-zinc-400">{item.value}%</p>
              </div>

              <div className="mt-1 h-2 rounded bg-zinc-800">
                <div
                  className={`h-2 rounded ${barColor}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}