"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Modal from "@/components/ui/modal/Modal";

export type ScanDetail = {
  id: string;
  name: string;
  status: "running" | "pass" | "fail";
  startedAt?: string;
  scannedAt?: string;
  config?: string;
  issue?: string;
};

function formatElapsed(startedAt: string, now: number): string {
  const diff = Math.floor((now - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function DetailRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className={`text-right text-sm text-zinc-200 ${mono ? "font-mono" : ""} break-all`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ScanDetail["status"] }) {
  if (status === "running") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
        <Loader2 size={12} className="animate-spin text-emerald-400" />
        <span className="font-mono text-xs text-emerald-400">RUNNING</span>
      </div>
    );
  }
  if (status === "pass") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
        <CheckCircle2 size={12} className="text-emerald-400" />
        <span className="font-mono text-xs text-emerald-400">PASS</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1">
      <XCircle size={12} className="text-red-400" />
      <span className="font-mono text-xs text-red-400">FAIL</span>
    </div>
  );
}

type Props = {
  scan: ScanDetail | null;
  onClose: () => void;
};

export default function ScanDetailModal({ scan, onClose }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!scan || scan.status !== "running") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [scan]);

  if (!scan) return null;

  return (
    <Modal isOpen={!!scan} onClose={onClose} title={`scan.detail — ${scan.name}`}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="font-mono text-lg text-zinc-100">{scan.name}</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">{scan.id}</p>
        </div>
        <StatusBadge status={scan.status} />
      </div>

      {scan.status === "running" && scan.startedAt && (
        <div className="mb-6 overflow-hidden rounded-full bg-zinc-900">
          <div className="scan-progress h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2 divide-y divide-zinc-800/60">
        {scan.startedAt && (
          <DetailRow label="Started At" value={new Date(scan.startedAt).toLocaleString()} />
        )}
        {scan.scannedAt && <DetailRow label="Scanned At" value={scan.scannedAt} />}
        {scan.status === "running" && scan.startedAt && (
          <DetailRow label="Elapsed" value={formatElapsed(scan.startedAt, now)} />
        )}
        {scan.config && <DetailRow label="Config Profile" value={scan.config} />}
        {scan.issue && (
          <DetailRow label="Issue" value={scan.issue} mono={false} />
        )}
      </div>

      <style jsx>{`
        .scan-progress {
          animation: scanSlide 1.8s linear infinite;
          width: 40%;
        }
        @keyframes scanSlide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </Modal>
  );
}
