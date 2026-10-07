import { messageKey } from '../lib/i18n/message-key';
export const RENTAL_API = {
  TENANTS: '/api/v1/tenants',
  DOCUMENTS: '/api/v1/documents',
  LEASES: '/api/v1/leases',
} as const;
export const RENTAL_PERMISSION = {
  TENANT_READ: 'tenant:read',
  TENANT_CREATE: 'tenant:create',
  TENANT_UPDATE: 'tenant:update',
  LEASE_READ: 'lease:read',
  LEASE_CREATE: 'lease:create',
  LEASE_UPDATE: 'lease:update',
} as const;
export const RENTAL_LIMIT = {
  UPLOAD_BYTES: 10485760,
  PROGRESS: 100,
  DUE_DAY: 28,
  NAME: 200,
  PHONE: 30,
  MEMBERS: 20,
  ID_MIN: 4,
  ID_MAX: 100,
} as const;
export const UPLOAD_MIMES = ['application/pdf', 'image/jpeg', 'image/png'] as readonly string[];
export const TENANT_STATES = ['PENDING_KYC', 'VERIFIED', 'REJECTED', 'INACTIVE'] as const;
export const DOCUMENT_TYPES = ['AADHAAR', 'PAN', 'PASSPORT', 'PHOTO', 'OTHER'] as const;
export const DOCUMENT_STATES = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export const LEASE_STATES = [
  'PENDING_DEPOSIT',
  'ACTIVE',
  'EXPIRING',
  'EXPIRED',
  'RENEWED',
  'TERMINATED',
] as const;
export const RENTAL_STATE = {
  PENDING_KYC: 'PENDING_KYC',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING_DEPOSIT',
  ACTIVE: 'ACTIVE',
  EXPIRING: 'EXPIRING',
  RENEWED: 'RENEWED',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
} as const;
export const RENTAL_ROUTE = {
  TENANTS: '/tenants',
  LEASES: '/leases',
  MY_LEASE: '/tenant/my-lease',
  PROFILE: '/tenant/profile',
} as const;
export const RENTAL_KEYS = {
  tenants: ['tenants'],
  leases: ['leases'],
  documents: (id: string): readonly string[] => ['documents', id],
  tenant: (id: string): readonly string[] => ['tenant', id],
  lease: (id: string): readonly string[] => ['lease', id],
} as const;
export const STATUS_MESSAGES = {
  PENDING_KYC: messageKey('rental.statusPendingKyc'),
  VERIFIED: messageKey('rental.statusVerified'),
  REJECTED: messageKey('rental.statusRejected'),
  INACTIVE: messageKey('rental.statusInactive'),
  PENDING: messageKey('rental.statusPending'),
  PENDING_DEPOSIT: messageKey('rental.statusPendingDeposit'),
  ACTIVE: messageKey('rental.statusActive'),
  EXPIRING: messageKey('rental.statusExpiring'),
  EXPIRED: messageKey('rental.statusExpired'),
  RENEWED: messageKey('rental.statusRenewed'),
  TERMINATED: messageKey('rental.statusTerminated'),
} as const;
export const TYPE_MESSAGES = {
  AADHAAR: messageKey('rental.aadhaar'),
  PAN: messageKey('rental.pan'),
  PASSPORT: messageKey('rental.passport'),
  PHOTO: messageKey('rental.photo'),
  OTHER: messageKey('rental.other'),
} as const;

export const ONBOARDING_STEP = { DETAILS: 0, DOCUMENTS: 1, REVIEW: 2 } as const;

export const RENTAL_DEFAULT = { DUE_DAY: 5 } as const;
