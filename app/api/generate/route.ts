import { NextResponse } from "next/server";

const REPORT_API = (process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001").replace(/\/api\/?$/, "");

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${REPORT_API}/api/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return new NextResponse("Gateway Error", { status: 502 })
  }
}