import { WING_LIMIT } from '../../../config/unit.constants';
import { z } from 'zod';
import { MONEY_PATTERN, UNIT_TYPE, UNIT_LIMITS as L } from '../../../config/unit.constants';
import type { BulkPattern } from '../api/units-api';
export const UNIT_SCHEMA = z.object({
  code: z.string().trim().min(1).max(L.CODE),
  type: z.enum(Object.values(UNIT_TYPE)),
  baseRent: z.string().regex(MONEY_PATTERN),
  capacity: z.number().int().min(1).max(L.CAPACITY),
  floorId: z.uuid().nullable().optional(),
});
export const BULK_SCHEMA = z
  .object({
    floors: z.number().int().min(1).max(L.FLOORS),
    perFloor: z.number().int().min(1).max(L.PER_FLOOR),
    prefix: z.string().regex(/^[A-Za-z0-9_-]{1,10}$/),
    startFloor: z.number().int().min(L.MIN_FLOOR).max(L.MAX_FLOOR),
    startNumber: z.number().int().min(1).max(L.MAX),
    wing: z.string().max(WING_LIMIT),
    type: z.enum(Object.values(UNIT_TYPE)),
    baseRent: z.string().regex(MONEY_PATTERN),
    capacity: z.number().int().min(1).max(L.CAPACITY),
  })
  .refine((p) => p.floors * p.perFloor <= L.MAX && p.startFloor + p.floors - 1 <= L.MAX_FLOOR);
export function bulkPreview(p: BulkPattern): string[] {
  if (!BULK_SCHEMA.safeParse(p).success) return [];
  return Array.from(
    { length: Math.min(p.floors * p.perFloor, L.PREVIEW) },
    (_, i) =>
      p.prefix +
      String(p.startFloor + Math.floor(i / p.perFloor)).padStart(L.PAD, '0') +
      '-' +
      String(p.startNumber + (i % p.perFloor)).padStart(L.PAD, '0'),
  );
}
