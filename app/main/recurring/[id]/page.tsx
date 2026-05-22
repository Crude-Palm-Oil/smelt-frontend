import { notFound } from "next/navigation";
import RecurringDetail from "@/components/recurring/RecurringDetail";
import { getRecurringScan } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function RecurringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getRecurringScan(id);
  if (!detail) notFound();
  return <RecurringDetail detail={detail} />;
}
