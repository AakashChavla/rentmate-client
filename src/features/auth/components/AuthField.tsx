'use client';
import { useTranslations } from 'next-intl';
import { InputField } from '../../../components/ui/FormField';
import { messageKey } from '../../../lib/i18n/message-key';
import type { InputHTMLAttributes } from 'react';
export const FIELD_KEYS = {
  fullName: messageKey('auth.fullName'),
  email: messageKey('auth.email'),
  password: messageKey('auth.password'),
  phone: messageKey('auth.phone'),
  organizationName: messageKey('auth.organizationName'),
  currentPassword: messageKey('auth.currentPassword'),
} as const;
export function AuthField({
  field,
  ...props
}: { field: keyof typeof FIELD_KEYS } & InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  const t = useTranslations();
  return <InputField label={t(FIELD_KEYS[field])} name={field} {...props} />;
}
