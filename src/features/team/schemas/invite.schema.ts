import { z } from 'zod';
import { INVITE_ROLES } from '../../../config/property.constants';
import { ROLE_SCOPE, PASSWORD_PATTERN, AUTH_LIMITS } from '../../../config/auth.constants';
export const inviteSchema = z
  .object({
    email: z.email(),
    roleKey: z.enum(INVITE_ROLES),
    scopeType: z.enum([ROLE_SCOPE.ORGANIZATION, ROLE_SCOPE.PROPERTY]),
    scopeId: z.uuid().optional(),
  })
  .refine((input) => input.scopeType !== ROLE_SCOPE.PROPERTY || !!input.scopeId);
export const acceptSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  fullName: z.string().trim().min(1).max(AUTH_LIMITS.NAME_MAX),
  password: z.string().regex(PASSWORD_PATTERN),
});
