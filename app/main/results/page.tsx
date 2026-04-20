import ResultsStats from "@/components/results/ResultsStats";
import ResultsTable from "@/components/results/ResultsTable";

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <ResultsStats />
      <ResultsTable />
    </div>
  );
}
