import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/auth";

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/main/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/main/:path*",
    "/auth",
  ],
};