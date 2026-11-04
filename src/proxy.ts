import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, LOCALE_COOKIE, LOCALES, negotiateLocale } from "@/i18n/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Two jobs:
 * - Public pages without a language prefix are redirected to /it or /en
 *   (the language picked with the switcher, else Accept-Language).
 * - Optimistic gate for the backoffice. The admin API routes and the admin
 *   page verify the session again on their own.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    const isLogin = pathname === "/admin/login";
    if (!authed && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (authed && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  const hasPrefix = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasPrefix) return NextResponse.next();

  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  const lang = hasLocale(saved) ? saved : negotiateLocale(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  // The target depends on these request headers: keep shared caches from mixing languages.
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (favicon, images…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
