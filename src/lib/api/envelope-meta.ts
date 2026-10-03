import { z } from 'zod';
import type { HttpMeta } from './http-client';
const metaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
  page: z
    .object({
      limit: z.number().int().positive(),
      hasNext: z.boolean(),
      nextCursor: z.string().nullable(),
    })
    .optional(),
});
export function parseEnvelopeMeta(value: unknown): HttpMeta | undefined {
  const parsed = metaSchema.safeParse(value);
  if (!parsed.success) return undefined;
  const { page, ...meta } = parsed.data;
  return { ...meta, ...(page ? { page } : {}) };
}
