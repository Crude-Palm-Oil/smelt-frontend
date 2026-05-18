"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Calls router.refresh() on an interval so server-rendered pages pick up new
// data without the user having to hit reload. router.refresh() re-runs the
// page's server-side fetches but preserves client state (search inputs,
// expanded cards, scroll position, etc.).
export default function AutoRefresh({
  intervalMs = 10_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
