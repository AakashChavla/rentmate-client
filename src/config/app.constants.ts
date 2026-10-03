export const SUPPORTED_LOCALES = ['en', 'hi'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const STORAGE_KEYS = { LOCALE: 'NEXT_LOCALE' } as const;
export const LOCALE_COOKIE_MAX_AGE = 31_536_000;
export const DIRECTIONS = { LTR: 'ltr', RTL: 'rtl' } as const;
export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur']);
export const ROUTES = { HOME: '/', HEALTH: '/health/live' } as const;
export const HTTP_METHODS = { GET: 'GET' } as const;
export const HTTP_HEADERS = {
  REQUEST_ID: 'X-Request-ID',
  ACCEPT_LANGUAGE: 'accept-language',
  NONCE: 'x-nonce',
} as const;
export const API_DEFAULT_URL = 'http://localhost:3000';
export const LOCALE_PATTERN = /^(en|hi)(?:-|$)/i;
export const COOKIE_PATTERN = /(?:^|;\s*)NEXT_LOCALE=(en|hi)(?:;|$)/i;
export const ERROR_CODES = { HTTP_ERROR: 'HTTP_ERROR' } as const;

export const ICON_SIZES = { BRAND: 24 } as const;
