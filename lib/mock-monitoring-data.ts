// TODO: replace with API calls when backend is ready

export type MonitorInterval = "6H" | "12H" | "24H";
export type MonitorStatus = "HEALTHY" | "WARN" | "ALERT";
export type AlertType = "FAIL" | "WARN" | "PASS";
export type AlertStatus = "NEW" | "ACK";

export interface MonitoredDomain {
  domain: string;
  interval: MonitorInterval;
  lastCheck: string;
  nextCheck: string;
  status: MonitorStatus;
  alerts: number;
}

export interface AlertHistoryItem {
  domain: string;
  type: AlertType;
  message: string;
  time: string;
  status: AlertStatus;
}

export const monitoredDomains: MonitoredDomain[] = [
  {
    domain: "example.com",
    interval: "24H",
    lastCheck: "2024-03-15 09:00",
    nextCheck: "2024-03-16 09:00",
    status: "HEALTHY",
    alerts: 0,
  },
  {
    domain: "api.example.com",
    interval: "6H",
    lastCheck: "2024-03-15 08:00",
    nextCheck: "2024-03-15 14:00",
    status: "WARN",
    alerts: 2,
  },
  {
    domain: "mail.example.com",
    interval: "12H",
    lastCheck: "2024-03-15 06:00",
    nextCheck: "2024-03-15 18:00",
    status: "ALERT",
    alerts: 5,
  },
  {
    domain: "cdn.example.com",
    interval: "24H",
    lastCheck: "2024-03-15 07:30",
    nextCheck: "2024-03-16 07:30",
    status: "HEALTHY",
    alerts: 0,
  },
];

export const alertHistory: AlertHistoryItem[] = [
  {
    domain: "mail.example.com",
    type: "FAIL",
    message: "Certificate expired — immediate renewal required",
    time: "2024-03-15 08:45",
    status: "NEW",
  },
  {
    domain: "api.example.com",
    type: "WARN",
    message: "Certificate expires in 14 days",
    time: "2024-03-15 08:00",
    status: "NEW",
  },
  {
    domain: "mail.example.com",
    type: "FAIL",
    message: "Weak signature algorithm detected (SHA-1)",
    time: "2024-03-14 22:10",
    status: "ACK",
  },
  {
    domain: "api.example.com",
    type: "WARN",
    message: "Subject Alternative Name missing for subdomain",
    time: "2024-03-14 14:00",
    status: "ACK",
  },
];
