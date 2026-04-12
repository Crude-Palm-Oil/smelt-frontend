import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

type AlertItem = {
  message: string;
  time: string;
  tone: "success" | "warning" | "error";
};

const alerts: AlertItem[] = [
  {
    message: "Certificate expiring in 14 days: *.corp.internal",
    time: "2h ago",
    tone: "warning",
  },
  {
    message: "Non-compliant algorithm detected: mail.corp.internal",
    time: "5h ago",
    tone: "error",
  },
  {
    message: "Monitoring check passed: api.example.com",
    time: "12h ago",
    tone: "success",
  },
];

function getAlertIcon(tone: AlertItem["tone"]) {
  switch (tone) {
    case "warning":
      return <AlertTriangle size={22} className="text-amber-400" strokeWidth={2} />;
    case "error":
      return <AlertCircle size={22} className="text-red-400" strokeWidth={2} />;
    case "success":
      return <CheckCircle2 size={22} className="text-emerald-400" strokeWidth={2} />;
  }
}

export default function AlertFeed() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl tracking-[0.2em] text-zinc-100">ALERT FEED</h2>
        <p className="mt-4 text-sm text-zinc-500">
          Recent alerts from monitored domains
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={`${alert.message}-${alert.time}`}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-5"
            >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
              {getAlertIcon(alert.tone)}
              </div>
              <div>
              <p className="text-base text-zinc-300 leading-relaxed">
                  {alert.message}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                  {alert.time}
              </p>
              </div>
            </div>
            </div>
        ))}
      </div>
    </section>
  );
}