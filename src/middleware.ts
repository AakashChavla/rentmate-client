import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, LOGIN_PATH } from "@/lib/auth/constants";

/**
 * TODO(cookie-visibility): The session cookie is set by the API domain
 * (rentmate-server), not by this Next.js app. Middleware can read it only when
 * the browser stores it for a host this app shares.
 * - Production: the client and API must share a parent site (for example
 *   app.rentmate.com and api.rentmate.com) so a SameSite cookie is sent when
 *   the user opens this app.
 * - Localhost: ports 3000 and 3001 are the same site, so a cookie set for host
 *   "localhost" is visible here during development.
 *
 * TODO(role-redirects): A present cookie only means "some session exists". It
 * does not say whether the user is an admin or a tenant. Once GET /auth/me (or
 * a role claim) is available, send admins to /admin/dashboard and tenants to
 * /tenant/dashboard, and refuse the other portal.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }

  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = "";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/tenant/:path*"],
};
