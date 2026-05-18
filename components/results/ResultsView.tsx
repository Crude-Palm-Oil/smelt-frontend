"use client";

import { useState } from "react";
import type { FinishedScan } from "@/lib/mock-results-data";
import ResultsStats, { type SeverityFilter } from "./ResultsStats";
import ResultsTable from "./ResultsTable";

// Wraps the stats bar and the table so the stats cards can filter the table.
// Lives in a client component so the click → filter flow doesn't need a
// server round-trip.
export default function ResultsView({ scans }: { scans: FinishedScan[] }) {
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
      <ResultsTable scans={scans} severityFilter={severityFilter} />
    </>
  );
}
