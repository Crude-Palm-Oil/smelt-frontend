"use server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_SCAN_URL || "http://localhost:8000";

export async function uploadAndScanCertificates(formData: FormData) {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/upload-and-scan`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return await res.json();
  } catch (error: any) {
    return {
      error: true,
      message: error.message || "Upload failed",
    };
  }
}

export async function scanTargets(payload: {
  type: "target";
  targets: any[];
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/integration/scan-targets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return await res.json();
  } catch (error: any) {
    return {
      error: true,
      message: error.message || "Scan failed",
    };
  }
}