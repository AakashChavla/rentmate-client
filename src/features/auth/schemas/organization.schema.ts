import { z } from 'zod';
import { AUTH_LIMITS } from '../../../config/auth.constants';
import { SUPPORTED_LOCALES } from '../../../config/app.constants';
export const organizationSchema = z.object({
  organizationName: z.string().trim().min(1).max(AUTH_LIMITS.NAME_MAX),
  locale: z.enum(SUPPORTED_LOCALES),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
});
export type OrganizationFields = {
  organizationName: string;
  locale: (typeof SUPPORTED_LOCALES)[number];
  acceptTerms: boolean;
  acceptPrivacy: boolean;
};
