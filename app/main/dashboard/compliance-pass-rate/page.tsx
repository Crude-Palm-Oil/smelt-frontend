import { getCompliancePassFindings } from "@/lib/server/dashboard";
import CompliancePassRateClient from "@/components/dashboard/client/CompliancePassRateClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompliancePassRatePage() {
  const findings = await getCompliancePassFindings();

  return <CompliancePassRateClient findings={findings} />;
}