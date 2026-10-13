import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, readAdminSession } from "@/lib/adminAuth";

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

function isProtectedAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedAdminPath(pathname) || isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const session = await readAdminSession(
    request.cookies.get(adminCookieName())?.value
  );
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/((?!login$).*)", "/api/admin/((?!login$).*)"],
};
