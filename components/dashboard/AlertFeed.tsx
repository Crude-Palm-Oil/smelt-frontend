import { getAlerts } from "@/lib/server/dashboard";
import AlertFeedClient from "./client/AlertFeedClient";

export default async function AlertFeed() {
  const alerts = await getAlerts();

  return <AlertFeedClient alerts={alerts} />;
}