import { NextResponse } from "next/server";

const REPORT_API = (process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001").replace(/\/api\/?$/, "");

/**
 * Proxies HTML reports from the FastAPI reports service.
 * Runs server-side inside Docker so it can reach the internal reports:8001 URL.
 * ?download=true forces a file download, otherwise serves inline in the browser.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await params;
  const { searchParams } = new URL(request.url);
  const isDownload = searchParams.get("download") === "true";

  const endpoint = isDownload
    ? `${REPORT_API}/api/reports/download/${scan_id}`
    : `${REPORT_API}/api/reports/serve/${scan_id}`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });

    if (!res.ok) {
      return new NextResponse("Report not available", { status: res.status });
    }

    const html = await res.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": isDownload
          ? `attachment; filename="report-${scan_id}.html"`
          : "inline",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Report proxy failed:", error);
    return new NextResponse("Gateway Error", { status: 502 });
  }
}