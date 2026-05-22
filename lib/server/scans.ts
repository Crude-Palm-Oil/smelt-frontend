"use server";

const API_BASE_URL =
  process.env.API_SCAN_URL ||
  process.env.NEXT_PUBLIC_API_SCAN_URL ||
  "http://backend:8000";

export async function uploadAndScanCertificates(formData: FormData) {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/upload-and-scan`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "Upload failed");
    }

    return text ? JSON.parse(text) : null;
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function uploadAndScanDnsZone(formData: FormData) {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/scan-dns-zone`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "DNS zone scan failed");
    }

    return text ? JSON.parse(text) : null;
  } catch (error) {
    return {
      error: true,
      message:
        error instanceof Error ? error.message : "DNS zone scan failed",
    };
  }
}

export async function scanTargets(payload: {
  name: string;
  type: "target";
  targets: Array<{ ip_address?: string; hostname?: string; port: number }>;
  cron?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/scan-targets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "Scan failed");
    }

    return text ? JSON.parse(text) : null;
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "Scan failed",
    };
  }
}