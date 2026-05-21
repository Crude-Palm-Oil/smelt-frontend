import { getExpiringSoon } from "@/lib/server/dashboard";
import ExpiryReviewClient from "@/components/dashboard/ExpiryReviewClient";

export default async function ExpiringSoonPage() {
  const expiringCertificates = await getExpiringSoon();

  return <ExpiryReviewClient findings={expiringCertificates} />;
}