import ExpiryReviewClient from "@/components/dashboard/client/ExpiryReviewClient";
import { getExpiringSoon } from "@/lib/server/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ExpiringSoonPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function ExpiringSoonPage({
  searchParams,
}: ExpiringSoonPageProps) {
  const params = await searchParams;

  const initialTab =
    params?.tab === "expiring-soon" ? "expiring-soon" : "expired";

  const findings = await getExpiringSoon();

  return <ExpiryReviewClient findings={findings} initialTab={initialTab} />;
}