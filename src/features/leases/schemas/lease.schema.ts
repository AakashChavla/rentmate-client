import { z } from 'zod';
import { RENTAL_LIMIT as L } from '../../../config/lease.constants';
export const LEASE_SCHEMA = z
  .object({
    tenantId: z.uuid(),
    unitId: z.uuid(),
    bedId: z.uuid().nullable().optional(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    rent: z.string().regex(/^\d{1,10}\.\d{2}$/),
    deposit: z.string().regex(/^\d{1,10}\.\d{2}$/),
    dueDay: z.number().int().min(1).max(L.DUE_DAY),
    members: z.array(z.string().trim().min(1).max(L.NAME)).max(L.MEMBERS).optional(),
  })
  .refine((v) => v.startDate < v.endDate);
