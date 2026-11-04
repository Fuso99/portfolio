import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Optimistic gate for the backoffice pages. The admin API routes and the
 * admin page verify the session again on their own.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === "/admin/login";

  if (!authed && !isLogin) {
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }
  if (authed && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
