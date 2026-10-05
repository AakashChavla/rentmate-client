import { z } from 'zod';
import { AUTH_LIMITS as L, PASSWORD_PATTERN } from '../../../config/auth.constants';
export const accountSchema = z.object({
  fullName: z.string().trim().min(1).max(L.NAME_MAX),
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(L.PASSWORD_MIN).max(L.PASSWORD_MAX).regex(PASSWORD_PATTERN),
  phone: z.string().max(L.PHONE_MAX),
});
export type AccountFields = z.infer<typeof accountSchema>;
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(L.PASSWORD_MAX),
});
export const resetSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().regex(PASSWORD_PATTERN),
});
