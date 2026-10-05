import { isPrivateRoute } from './lib/auth-policy';
import { ROUTES, COOKIE_NAMES } from './config/app.constants';
import { environment } from './lib/env';
import { NextResponse, type NextRequest } from 'next/server';
import {
  CSP_HEADER,
  NONCE_HEADER,
  DEVELOPMENT_ENVIRONMENT,
  createCsp,
} from './config/csp.constants';
export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = createCsp(
    nonce,
    process.env.NODE_ENV === DEVELOPMENT_ENVIRONMENT,
    environment.NEXT_PUBLIC_API_URL,
  );
  const headers = new Headers(request.headers);
  headers.set(NONCE_HEADER, nonce);
  headers.set(CSP_HEADER, policy);
  const url = request.nextUrl.clone();
  const blocked = isPrivateRoute(url.pathname) && !request.cookies.has(COOKIE_NAMES.SESSION);
  const next = url.pathname + url.search;
  if (blocked) {
    url.pathname = ROUTES.LOGIN;
    url.search = '';
    url.searchParams.set('next', next);
  }
  const response = blocked
    ? NextResponse.redirect(url)
    : NextResponse.next({ request: { headers } });
  response.headers.set(CSP_HEADER, policy);
  return response;
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
