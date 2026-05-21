import { NextResponse } from "next/server";

const REPORT_API = (process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001").replace(/\/api\/?$/, "");

export async function GET() {
  try {
    const res = await fetch(`${REPORT_API}/api/reports`, { cache: "no-store" })
    if (!res.ok) return new NextResponse("Error", { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return new NextResponse("Gateway Error", { status: 502 })
  }
}