import RecurringTable from "@/components/recurring/RecurringTable";
import AutoRefresh from "@/components/ui/AutoRefresh";
import { getRecurringScans } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const rows = await getRecurringScans();

  return (
    <div className="flex flex-col gap-8 p-8">
      <AutoRefresh />
      <RecurringTable initialRows={rows} />
    </div>
  );
}
