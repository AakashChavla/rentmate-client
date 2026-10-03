import { API_DEFAULT_URL } from './app.constants';
export const CSP_HEADER = 'Content-Security-Policy';
export const NONCE_HEADER = 'x-nonce';
export const DEVELOPMENT_ENVIRONMENT = 'development';
export const CSP_PARTS = {
  DEFAULT: "default-src 'self'",
  SCRIPT: "script-src 'self'",
  NONCE_PREFIX: "'nonce-",
  STRICT_DYNAMIC: "'strict-dynamic'",
  DEVELOPMENT_EVAL: "'unsafe-eval'",
  STYLE: "style-src 'self'",
  STYLE_ATTRIBUTES: "style-src-attr 'unsafe-inline'",
  IMAGES: "img-src 'self' data:",
  FONTS: "font-src 'self'",
  CONNECT: "connect-src 'self'",
  DEVELOPMENT_CONNECT: 'ws://localhost:3001 ws://127.0.0.1:3001',
  NONE_OBJECTS: "object-src 'none'",
  BASE: "base-uri 'self'",
  FRAMES: "frame-ancestors 'none'",
  FORM: "form-action 'self'",
} as const;
export function createCsp(nonce: string, development: boolean, apiUrl = API_DEFAULT_URL): string {
  const nonceSource = `${CSP_PARTS.NONCE_PREFIX}${nonce}'`;
  const apiOrigin = new URL(apiUrl).origin;
  return [
    CSP_PARTS.DEFAULT,
    [
      CSP_PARTS.SCRIPT,
      nonceSource,
      CSP_PARTS.STRICT_DYNAMIC,
      development ? CSP_PARTS.DEVELOPMENT_EVAL : '',
    ].join(' '),
    [CSP_PARTS.STYLE, nonceSource].join(' '),
    CSP_PARTS.STYLE_ATTRIBUTES,
    CSP_PARTS.IMAGES,
    CSP_PARTS.FONTS,
    [CSP_PARTS.CONNECT, apiOrigin, development ? CSP_PARTS.DEVELOPMENT_CONNECT : ''].join(' '),
    CSP_PARTS.NONE_OBJECTS,
    CSP_PARTS.BASE,
    CSP_PARTS.FRAMES,
    CSP_PARTS.FORM,
  ].join('; ');
}
