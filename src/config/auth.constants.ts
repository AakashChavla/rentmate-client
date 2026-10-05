export const AUTH_API = {
  ME: '/api/v1/auth/me',
  LOGIN: '/api/v1/auth/login',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  REGISTER: '/api/v1/auth/register',
  VERIFY: '/api/v1/auth/register/verify',
  RESEND: '/api/v1/auth/register/resend',
  OTP_SEND: '/api/v1/auth/otp/send',
  OTP_VERIFY: '/api/v1/auth/otp/verify',
  FORGOT: '/api/v1/auth/password/forgot',
  RESET: '/api/v1/auth/password/reset',
  CHANGE: '/api/v1/auth/password/change',
  PREFIX: '/api/v1/auth',
} as const;
export const AUTH_QUERY = ['me'] as const;
export const AUTH_LIMITS = {
  STALE: 300000,
  RESEND: 60,
  MILLISECONDS: 1000,
  ROTATION_RETRY: 200,
  PASSWORD_MIN: 10,
  PASSWORD_MAX: 128,
  OTP_DIGITS: 6,
  PERCENT: 100,
  DEBOUNCE: 300,
  NAME_MAX: 200,
  PHONE_MAX: 30,
} as const;
export const AUTH_ERROR = {
  ROTATED: 'TOKEN_ROTATED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  INVALID: 'INVALID_CREDENTIALS',
  SUSPENDED: 'ACCOUNT_SUSPENDED',
  LOCKED: 'TOO_MANY_ATTEMPTS',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION: 'VALIDATION_ERROR',
} as const;
export const IDENTITY_ROLE = {
  OWNER: 'ORG_OWNER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT: 'TENANT',
} as const;
export const ROLE_SCOPE = { ORGANIZATION: 'ORGANIZATION', PROPERTY: 'PROPERTY' } as const;
export const TERMS_VERSION = '2026-10-05';
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[\s\S]{10,128}$/;
export const PRIVATE_PREFIXES = [
  '/dashboard',
  '/properties',
  '/tenants',
  '/billing',
  '/complaints',
  '/visitors',
  '/reports',
  '/settings',
  '/profile',
  '/tenant',
];
export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
];
export const PERMISSION = {
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  ROLE_ASSIGN: 'role:assign',
  ROLE_READ: 'role:read',
  ORGANIZATION_READ: 'organization:read',
  REPORT_READ: 'report:read',
  PROPERTY_READ: 'property:read',
  TENANT_READ: 'tenant:read',
  INVOICE_READ: 'invoice:read',
  PAYMENT_READ: 'payment:read',
  COMPLAINT_READ: 'complaint:read',
  VISITOR_READ: 'visitor:read',
  LEASE_READ: 'lease:read',
  AUTHENTICATED: 'authenticated',
} as const;
export const USER_API = '/api/v1/users';
export const ROLES_API = '/api/v1/roles';
export const PERMISSIONS_API = '/api/v1/permissions';
export const USERS_QUERY = ['users'] as const;
export const USER_STATUS_VALUES = [
  'PENDING_VERIFICATION',
  'INVITED',
  'ACTIVE',
  'SUSPENDED',
] as const;

export const USERS_ROUTE = '/settings/users';

export const USER_STATUS = { ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED' } as const;
export const NEXT_CHARACTER_LIMIT = 32;
