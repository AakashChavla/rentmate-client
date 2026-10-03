export const SUPPORTED_LOCALES = ['en', 'hi'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const STORAGE_KEYS = { LOCALE: 'NEXT_LOCALE', THEME: 'rm_theme' } as const;
export const LOCALE_COOKIE_MAX_AGE = 31536000;
export const DIRECTIONS = { LTR: 'ltr', RTL: 'rtl' } as const;
export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur']);
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  TENANTS: '/tenants',
  INVOICES: '/billing/invoices',
  PAYMENTS: '/billing/payments',
  COMPLAINTS: '/complaints',
  VISITORS: '/visitors',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  TENANT_DASHBOARD: '/tenant/dashboard',
  MY_LEASE: '/tenant/my-lease',
  TENANT_PAYMENTS: '/tenant/payments',
  TENANT_COMPLAINTS: '/tenant/complaints',
  TENANT_VISITORS: '/tenant/visitors',
  TENANT_PROFILE: '/tenant/profile',
  FORBIDDEN: '/forbidden',
  HEALTH: '/health/live',
  READY: '/health/ready',
} as const;
export const HTTP_METHODS = { GET: 'GET' } as const;
export const HTTP_HEADERS = {
  REQUEST_ID: 'X-Request-ID',
  ACCEPT_LANGUAGE: 'accept-language',
  NONCE: 'x-nonce',
  RETRY_AFTER: 'Retry-After',
} as const;
export const COOKIE_NAMES = {
  ACCESS: 'rm_access',
  REFRESH: 'rm_refresh',
  SESSION: 'rm_session',
  LOCALE: 'NEXT_LOCALE',
} as const;
export const API_DEFAULT_URL = 'http://localhost:3000';
export const LOCALE_PATTERN = /^(en|hi)(?:-|$)/i;
export const COOKIE_PATTERN = /(?:^|;\s*)NEXT_LOCALE=(en|hi)(?:;|$)/i;
export const ERROR_CODES = {
  HTTP_ERROR: 'HTTP_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;
export const ICON_SIZES = { BRAND: 24 } as const;
export const QUERY = {
  STALE_TIME_MS: 30000,
  RETRY_LIMIT: 2,
  CLIENT_ERROR: 400,
  SERVER_ERROR: 500,
} as const;
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  ATTRIBUTE: 'class',
} as const;
export const FORMAT = {
  CURRENCY: 'INR',
  TIMEZONE: 'Asia/Kolkata',
  LOCALE: { en: 'en-IN', hi: 'hi-IN' },
} as const;
export const API_STATUS = { UNAUTHORIZED: 401 } as const;
