"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ScanFinishedToast() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("scan") === "finished") {
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
        window.history.replaceState(null, "", "/main/results");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showToast) return null;

  return (
    <div className="fixed right-6 top-6 z-50 w-[380px] overflow-hidden rounded-xl border border-emerald-400/25 bg-[#0a0a0d]/95 shadow-[0_0_35px_rgba(52,211,153,0.16)] backdrop-blur">
      <div className="h-1 w-full bg-emerald-400" />

      <div className="flex gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Scan Finished
          </p>

          <p className="mt-1 text-sm text-zinc-300">Scan already finished!</p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            The compliance results are ready to review.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowToast(false)}
          className="text-zinc-500 transition hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
