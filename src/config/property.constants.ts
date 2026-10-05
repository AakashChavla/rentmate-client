import { messageKey } from '../lib/i18n/message-key';
export const PROPERTY_TYPE = {
  HOTEL: 'HOTEL',
  PG: 'PG_HOSTEL',
  APARTMENT: 'APARTMENT_COMPLEX',
  FLAT: 'INDIVIDUAL_FLAT',
} as const;
export const PROPERTY_TYPES = [
  PROPERTY_TYPE.HOTEL,
  PROPERTY_TYPE.PG,
  PROPERTY_TYPE.APARTMENT,
  PROPERTY_TYPE.FLAT,
] as const;
export const TYPE_KEYS = {
  HOTEL: messageKey('property.hotel'),
  PG_HOSTEL: messageKey('property.pg'),
  APARTMENT_COMPLEX: messageKey('property.apartment'),
  INDIVIDUAL_FLAT: messageKey('property.flat'),
};
export const PROPERTY_STATUS = { ACTIVE: 'ACTIVE', ARCHIVED: 'ARCHIVED' } as const;
export const STATUS_KEYS = {
  ACTIVE: messageKey('property.active'),
  ARCHIVED: messageKey('property.archived'),
};
export const DOMAIN_PERMISSION = {
  CREATE: 'property:create',
  UPDATE: 'property:update',
  DELETE: 'property:delete',
  READ: 'property:read',
  INVITE: 'user:invite',
  ORG_UPDATE: 'organization:update',
} as const;
export const DOMAIN_API = {
  PROPERTIES: '/api/v1/properties',
  ORGANIZATION: '/api/v1/organization',
  INVITATIONS: '/api/v1/invitations',
} as const;
export const DOMAIN_QUERY = {
  PROPERTIES: ['properties'],
  MINE: ['accessible-properties'],
  ORG: ['organization'],
  INVITES: ['invitations'],
} as const;
export const DOMAIN_ROUTE = {
  NEW: '/properties/new',
  TEAM: '/settings/team',
  ORG: '/settings/organization',
  ACCEPT: '/accept-invite',
} as const;
export const PROPERTY_PREFERENCE = {
  KEY: 'rm_property',
  PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  COOKIE: /(?:^|;\s*)rm_property=([0-9a-f-]+)(?:;|$)/i,
};
export const PROPERTY_DEFAULTS = {
  CURRENCY: 'INR',
  COUNTRY: 'IN',
  CHECK_IN: '14:00',
  CHECK_OUT: '11:00',
  DUE: 1,
  GRACE: 5,
  TIMEZONE: 'Asia/Kolkata',
} as const;
export const PROPERTY_LIMITS = {
  NAME: 200,
  ADDRESS: 300,
  CITY: 120,
  POSTAL: 20,
  TIMEZONE: 100,
  COUNTRY: 2,
  DUE: 28,
  GRACE: 31,
} as const;
export const WIZARD_STEP = { DETAILS: 0, ADDRESS: 1, CONFIG: 2 } as const;
export const DETAIL_TAB = { OVERVIEW: 'overview', SETTINGS: 'settings', TEAM: 'team' } as const;
export const INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;
export const INVITE_STATUS_KEYS = {
  PENDING: messageKey('team.pending'),
  ACCEPTED: messageKey('team.accepted'),
  REVOKED: messageKey('team.revoked'),
  EXPIRED: messageKey('team.expired'),
};
export const INVITE_ROLES = [
  'ORG_OWNER',
  'PROPERTY_MANAGER',
  'ACCOUNTANT',
  'RECEPTIONIST',
  'MAINTENANCE_STAFF',
  'SECURITY_STAFF',
  'TENANT',
] as const;
export const ONBOARDING_KEY = { PROPERTY: 'create_first_property', EMAIL: 'verifyEmail' } as const;
export const RING = { SIZE: 80, CENTER: 40, RADIUS: 32, STROKE: 6, PERCENT: 100 };
export function propertyRoute(id: string, edit = false): string {
  return '/properties/' + encodeURIComponent(id) + (edit ? '/edit' : '');
}

export const SVG_FILL = 'none';
export function inviteLoginRoute(home: string): string {
  return '/login?next=' + encodeURIComponent(home);
}
