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
  const response = NextResponse.next({ request: { headers } });
  response.headers.set(CSP_HEADER, policy);
  return response;
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
