import { notFound } from "next/navigation";
import TargetHistoryDetail from "@/components/results/TargetHistoryDetail";
import AutoRefresh from "@/components/ui/AutoRefresh";
import { getTargets, getTargetHistory } from "@/services/api";

export const dynamic = "force-dynamic";

// `key` is `${hostname-or-ip}:${port}` as built by TargetsTable.targetKey.
// We split off the last colon (IPv6 addresses contain colons too) and try
// to resolve the head as either a hostname or an IP from the targets list,
// then fetch history for that identity tuple.
function parseTargetKey(raw: string): { head: string; port: number } | null {
  const idx = raw.lastIndexOf(":");
  if (idx <= 0 || idx === raw.length - 1) return null;
  const head = raw.slice(0, idx);
  const port = Number(raw.slice(idx + 1));
  if (!Number.isFinite(port) || port <= 0 || port > 65535) return null;
  return { head, port };
}

function isLikelyIp(value: string): boolean {
  // Accept either IPv4 (dotted) or IPv6 (contains colons). Anything else
  // is treated as a hostname.
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || value.includes(":");
}

export default async function TargetHistoryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  const parsed = parseTargetKey(decoded);
  if (!parsed) notFound();

  const { head, port } = parsed!;
  const isIp = isLikelyIp(head);

  const [targets, history] = await Promise.all([
    getTargets(),
    getTargetHistory({
      hostname: isIp ? null : head,
      ipAddress: isIp ? head : null,
      port,
    }),
  ]);

  // The summary row drives the header; without it we can't render anything
  // useful, so 404 if the user navigated to a target that no longer exists.
  const summary = targets.find((t) => {
    if (t.port !== port) return false;
    if (isIp) return t.ipAddress === head;
    return t.hostname === head;
  });
  if (!summary) notFound();

  return (
    <>
      <AutoRefresh />
      <TargetHistoryDetail summary={summary!} history={history} />
    </>
  );
}
