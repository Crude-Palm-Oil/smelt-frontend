import { getCriticalFindings } from "@/lib/server/dashboard";
import CriticalFindingsClient from "@/components/dashboard/client/CriticalFindingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CriticalFindingsPage() {
  const findings = await getCriticalFindings();

  return <CriticalFindingsClient findings={findings} />;
}