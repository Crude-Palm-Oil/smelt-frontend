import { getCriticalFindings } from "@/lib/server/dashboard";
import CriticalFindingsClient from "@/components/dashboard/CriticalFindingsClient";

export default async function CriticalFindingsPage() {
  const findings = await getCriticalFindings();

  return <CriticalFindingsClient findings={findings} />;
}