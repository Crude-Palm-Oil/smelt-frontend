const stats = [
  { label: "Total Scans", value: "847", sub: "Last 30 days" },
  { label: "Certificates Analysed", value: "2,341", sub: "+127 this week", color: "text-emerald-400" },
  { label: "Non-Compliant", value: "89", sub: "3.8% fail rate", color: "text-red-400" },
  { label: "Monitored Domains", value: "34", sub: "12 active alerts", color: "text-amber-400" },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs text-zinc-500 uppercase">{stat.label}</p>
          <p className={`mt-4 text-3xl font-semibold ${stat.color ?? "text-white"}`}>
            {stat.value}
          </p>
          <p className="text-xs text-zinc-600 mt-2">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}