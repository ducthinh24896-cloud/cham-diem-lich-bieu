import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // lấy token từ cookie
  const token =
    req.cookies.get("admin-token")?.value;

  // chưa login
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  try {
    // chỉ check tồn tại token
    // nếu muốn check role admin thì decode ở client
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};