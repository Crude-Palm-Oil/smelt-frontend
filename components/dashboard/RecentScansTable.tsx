import { getRecentScans } from "@/lib/server/dashboard";
import RecentScansTableClient from "./client/RecentScansTableClient";

export default async function RecentScansTable() {
  const recentScans = await getRecentScans();

  return <RecentScansTableClient scans={recentScans} />;
}