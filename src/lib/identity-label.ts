import type { useTranslations } from 'next-intl';
import { IDENTITY_LABELS } from '../config/identity-labels.constants';
export function identityLabel(t: ReturnType<typeof useTranslations<never>>, value: string): string {
  return Object.hasOwn(IDENTITY_LABELS, value)
    ? t(IDENTITY_LABELS[value as keyof typeof IDENTITY_LABELS])
    : value;
}
