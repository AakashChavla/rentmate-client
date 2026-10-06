import { messageKey } from '../lib/i18n/message-key';
export const UNIT_API = '/api/v1/units',
  FLOOR_API = '/api/v1/floors',
  BED_API = '/api/v1/beds',
  UNIT_ROUTE = '/units';
export const UNIT_QUERY = ['units'] as const,
  FLOOR_QUERY = ['floors'] as const,
  OCCUPANCY_QUERY = ['occupancy'] as const,
  BED_QUERY = ['beds'] as const;
export const UNIT_PERMISSION = {
  READ: 'unit:read',
  CREATE: 'unit:create',
  UPDATE: 'unit:update',
  DELETE: 'unit:delete',
} as const;
export const UNIT_STATUS = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
  BLOCKED: 'BLOCKED',
} as const;
export const UNIT_TYPE = { ROOM: 'ROOM', FLAT: 'FLAT', SHOP: 'SHOP' } as const;
export const STATUS_KEYS = {
  VACANT: messageKey('unit.vacant'),
  OCCUPIED: messageKey('unit.occupiedStatus'),
  RESERVED: messageKey('unit.reserved'),
  MAINTENANCE: messageKey('unit.maintenance'),
  BLOCKED: messageKey('unit.blocked'),
};
export const TYPE_KEYS = {
  ROOM: messageKey('unit.room'),
  FLAT: messageKey('unit.flat'),
  SHOP: messageKey('unit.shop'),
};
export const AMENITY_KEYS = {
  AC: messageKey('unit.ac'),
  WIFI: messageKey('unit.wifi'),
  ATTACHED_BATHROOM: messageKey('unit.bathroom'),
  BALCONY: messageKey('unit.balcony'),
  PARKING: messageKey('unit.parking'),
  WARDROBE: messageKey('unit.wardrobe'),
  GEYSER: messageKey('unit.geyser'),
  POWER_BACKUP: messageKey('unit.backup'),
};
export const FURNISHING_KEYS = {
  UNFURNISHED: messageKey('unit.unfurnished'),
  SEMI_FURNISHED: messageKey('unit.semi'),
  FULLY_FURNISHED: messageKey('unit.full'),
};
export const STATUS_STYLE = {
  VACANT: 'border-emerald-500 bg-emerald-500/10',
  OCCUPIED: 'border-blue-500 bg-blue-500/10',
  RESERVED: 'border-amber-500 bg-amber-500/10',
  MAINTENANCE: 'border-orange-500 bg-orange-500/10',
  BLOCKED: 'border-slate-500 bg-slate-500/10',
};
export const UNIT_LIMITS = {
  CODE: 40,
  CAPACITY: 200,
  FLOORS: 50,
  PER_FLOOR: 200,
  MAX: 10000,
  MAX_FLOOR: 200,
  MIN_FLOOR: -20,
  PAD: 2,
  PREVIEW: 12,
  POLL: 1000,
  PERCENT: 100,
  CHART_HEIGHT: 180,
  OUTER_RADIUS: 70,
  INNER_RADIUS: 50,
};
export const BULK_STATUS = { COMPLETED: 'COMPLETED', FAILED: 'FAILED' } as const;
export const MONEY_PATTERN = /^(0|[1-9]\d{0,9})\.\d{2}$/;
export function propertyUnitPath(id: string): string {
  return '/api/v1/properties/' + encodeURIComponent(id);
}
export const CHART_COLORS = ['#2563eb', '#dbeafe'] as const;

export const BED_PROPERTY_TYPE = 'PG_HOSTEL',
  BED_UNIT_TYPE = 'ROOM';
export const WING_LIMIT = 60;
