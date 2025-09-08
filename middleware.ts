// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // ถ้าไม่มี token และกำลังจะเข้า /dashboard → redirect ไป signin
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ถ้ามี token และกำลังจะเข้าหน้าแรก (/) หรือ signin → redirect ไป dashboard
  if (
    token &&
    (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/signin")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/signin"], // เพิ่ม / และ /signin เข้าไปด้วย
};
