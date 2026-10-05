import { z } from 'zod';
import {
  PROPERTY_TYPE as T,
  PROPERTY_TYPES,
  PROPERTY_DEFAULTS as D,
  PROPERTY_LIMITS as L,
} from '../../../config/property.constants';
import type { PropertyConfig, Property } from '../api/properties-api';
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const currency = z.literal(D.CURRENCY);
const hotel = z.strictObject({ currency, checkInTime: time, checkOutTime: time });
const rent = z.strictObject({
  currency,
  rentDueDay: z.number().int().min(1).max(L.DUE),
  graceDays: z.number().int().min(0).max(L.GRACE),
});
export const CONFIG_SCHEMAS = {
  [T.HOTEL]: hotel,
  [T.PG]: rent,
  [T.APARTMENT]: rent,
  [T.FLAT]: rent,
};
export const detailsSchema = z.object({
  name: z.string().trim().min(1).max(L.NAME),
  type: z.enum(PROPERTY_TYPES),
});
const timezone = z
  .string()
  .max(L.TIMEZONE)
  .refine((value) => {
    if (!value) return true;
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch {
      return false;
    }
  });
export const addressSchema = z.object({
  addressLine1: z.string().trim().min(1).max(L.ADDRESS),
  addressLine2: z.string().max(L.ADDRESS),
  city: z.string().trim().min(1).max(L.CITY),
  state: z.string().trim().min(1).max(L.CITY),
  postalCode: z.string().trim().min(1).max(L.POSTAL),
  country: z.string().length(L.COUNTRY),
  timezone,
});
export type PropertyFields = z.infer<typeof detailsSchema> & z.infer<typeof addressSchema>;
export function initialProperty(property?: Property): PropertyFields {
  const base = {
    name: '',
    type: T.HOTEL,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: D.COUNTRY,
    timezone: '',
  };
  if (!property) return base;
  return {
    ...base,
    ...property,
    addressLine2: property.addressLine2 ?? '',
    timezone: property.timezone ?? '',
  };
}
export function defaultConfig(type: Property['type']): PropertyConfig {
  return type === T.HOTEL
    ? { currency: D.CURRENCY, checkInTime: D.CHECK_IN, checkOutTime: D.CHECK_OUT }
    : { currency: D.CURRENCY, rentDueDay: D.DUE, graceDays: D.GRACE };
}
