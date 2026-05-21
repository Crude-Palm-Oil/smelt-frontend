"use client";

import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Fires on /main/monitoring?scan=started. The scan submission flow on
// /main/scan now fires the analysis request server-side without blocking
// the client, redirecting here so the user can watch progress on the
// Ongoing Scans widget. This toast gives them the "we got it, hang tight"
// confirmation that used to be implicit in the blocking-redirect flow.
export default function ScanStartedToast() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("scan") === "started") {
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
        // Strip the param so a refresh doesn't re-trigger the toast.
        window.history.replaceState(null, "", "/main/monitoring");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showToast) return null;

  return (
    <div
      className="fixed right-6 top-6 z-50 w-[380px] overflow-hidden rounded-xl border border-emerald-400/25 bg-[#0a0a0d]/95 shadow-[0_0_35px_rgba(52,211,153,0.16)] backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className="h-1 w-full bg-emerald-400" />

      <div className="flex gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <Activity className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Scan Started
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            Your scan is running in the background.
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Watch progress in the Ongoing list. Findings appear in Results when it
            finishes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowToast(false)}
          className="shrink-0 text-zinc-500 transition hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
