import { notFound } from "next/navigation";
import CertificateHistoryDetail from "@/components/results/CertificateHistoryDetail";
import AutoRefresh from "@/components/ui/AutoRefresh";
import { getCertificates, getCertificateHistory } from "@/services/api";

export const dynamic = "force-dynamic";

// `name` is the Subject Common Name. Multiple cert binaries sharing the
// same CN collapse to one identity in the Certificates tab, so this page
// renders the union of their scan history.
export default async function CertificateHistoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);

  const [certificates, history] = await Promise.all([
    getCertificates(),
    getCertificateHistory(decoded),
  ]);

  const summary = certificates.find((c) => c.commonName === decoded);
  if (!summary) notFound();

  return (
    <>
      <AutoRefresh />
      <CertificateHistoryDetail summary={summary!} history={history} />
    </>
  );
}
