"use client";

import { useState } from "react";
import { FileText, Target as TargetIcon, Shield } from "lucide-react";
import type {
  CertificateSummary,
  FinishedScan,
  TargetSummary,
} from "@/lib/mock-results-data";
import ResultsStats, { type SeverityFilter } from "./ResultsStats";
import ResultsTable from "./ResultsTable";
import TargetsTable from "./TargetsTable";
import CertificatesTable from "./CertificatesTable";

type Tab = "scans" | "targets" | "certificates";

// Container for the three Results views. Stats remain global (computed
// from finished scans) so they don't oscillate when the user switches
// tabs — the cards are a stable summary of the whole dataset, not the
// active tab. Severity filter still applies only to the scans table.
export default function ResultsView({
  scans,
  targets,
  certificates,
}: {
  scans: FinishedScan[];
  targets: TargetSummary[];
  certificates: CertificateSummary[];
}) {
  const [tab, setTab] = useState<Tab>("scans");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter | null>(
    null,
  );

  return (
    <>
      <ResultsStats
        scans={scans}
        activeFilter={severityFilter}
        onFilterChange={setSeverityFilter}
      />

      <div className="flex border-b border-zinc-800">
        <TabButton
          active={tab === "scans"}
          label="Scans"
          icon={<FileText size={14} />}
          onClick={() => setTab("scans")}
        />
        <TabButton
          active={tab === "targets"}
          label="Targets"
          icon={<TargetIcon size={14} />}
          count={targets.length}
          onClick={() => setTab("targets")}
        />
        <TabButton
          active={tab === "certificates"}
          label="Certificates"
          icon={<Shield size={14} />}
          count={certificates.length}
          onClick={() => setTab("certificates")}
        />
      </div>

      {tab === "scans" && (
        <ResultsTable scans={scans} severityFilter={severityFilter} />
      )}
      {tab === "targets" && <TargetsTable targets={targets} />}
      {tab === "certificates" && (
        <CertificatesTable certificates={certificates} />
      )}
    </>
  );
}

function TabButton({
  active,
  label,
  icon,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative -mb-px flex items-center gap-2 border-b-2 px-5 pb-3 pt-2 text-xs font-mono uppercase tracking-widest transition ${
        active
          ? "border-emerald-400 text-emerald-400"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] ${
            active
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
