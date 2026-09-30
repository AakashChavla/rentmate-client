import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, LOGIN_PATH } from "@/lib/auth/constants";
import { ADMIN_HOME } from "@/lib/auth/home";

/**
 * `rm_session` is an httpOnly presence hint set by rentmate-server. It means
 * "maybe logged in". It is not an authorization decision — the API enforces
 * every permission. Middleware cannot see the role, so a present cookie on
 * /login or /verify-otp goes to the admin dashboard and the client layout
 * sends TENANT-only users to their own home.
 *
 * Production: set the server's COOKIE_DOMAIN to a shared parent
 * (for example .rentmate.com) so this app and the API both receive the cookie.
 * On localhost, ports 3000 and 3001 are the same site, so the cookie is visible.
 */
function isLoginRoute(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/") || pathname === "/verify-otp";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = session ? ADMIN_HOME : LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!session && (pathname.startsWith("/admin") || pathname.startsWith("/tenant"))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginRoute(pathname)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = ADMIN_HOME;
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/tenant/:path*", "/login", "/login/:path*", "/verify-otp"],
};
