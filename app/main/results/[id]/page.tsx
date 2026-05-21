import { permanentRedirect } from "next/navigation";

// Legacy route shim. The scan detail moved to `/main/results/scan/[id]`
// when the Results page gained Targets and Certificates tabs. Anything
// still linking at the old path (the scan-finished toast handoff,
// existing bookmarks, history entries that pre-date the refactor) gets
// transparently redirected.
export default async function LegacyScanRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/main/results/scan/${id}`);
}
