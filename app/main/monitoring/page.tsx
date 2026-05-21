import { redirect } from "next/navigation";

// Monitoring was folded into Results. The Ongoing Scans widget moved to
// the top of the Scans tab; alerts/history are derivable from the
// finished-scans list and were removed. Preserving the query string here
// keeps the scan-submission handoff (`?scan=started` triggering the
// Started toast) working without touching scan-page code.
export default async function MonitoringRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") qs.set(k, v);
  }
  const query = qs.toString();
  redirect(`/main/results${query ? `?${query}` : ""}`);
}
