"use server";

const API_BASE_URL =
  process.env.API_CONFIG_URL ||
  process.env.API_SCAN_URL ||
  process.env.NEXT_PUBLIC_API_SCAN_URL ||
  "http://backend:8000";

type SaveConfigPayload = {
  domain: string;
  policies: string[];
  expiry_warning_days: number;
  issuer: string;
  allow_tls_1_2: boolean;
  cipher_suites: string[];
};

export async function saveConfiguration(payload: SaveConfigPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "Failed to save configuration");
    }

    try {
      return {
        success: true,
        data: text ? JSON.parse(text) : null,
      };
    } catch {
      return {
        success: true,
        data: text,
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error",
    };
  }
}