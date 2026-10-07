import { messageKey } from '../../../lib/i18n/message-key';
import { z } from 'zod';
import { RENTAL_LIMIT as L, UPLOAD_MIMES } from '../../../config/lease.constants';
export const TENANT_SCHEMA = z.object({
  propertyId: z.uuid(),
  fullName: z.string().trim().min(1).max(L.NAME),
  phone: z.string().trim().min(1).max(L.PHONE),
  email: z.email(),
  emergencyContact: z.string().optional(),
  idNumber: z.string().min(L.ID_MIN).max(L.ID_MAX).optional(),
});
export function uploadValidation(
  file: File,
): 'rental.uploadTypeError' | 'rental.uploadSizeError' | null {
  if (!UPLOAD_MIMES.includes(file.type)) return messageKey('rental.uploadTypeError');
  if (!file.size || file.size > L.UPLOAD_BYTES) return messageKey('rental.uploadSizeError');
  return null;
}
