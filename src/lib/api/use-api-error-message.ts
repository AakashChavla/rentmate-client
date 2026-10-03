'use client';
import { useTranslations } from 'next-intl';
import { ApiError } from './api-error';
import { ERROR_KEYS } from './error-keys.constants';
export function useApiErrorMessage(): (error: ApiError) => string {
  const t = useTranslations();
  return (error) =>
    Object.hasOwn(ERROR_KEYS, error.code)
      ? t(ERROR_KEYS[error.code as keyof typeof ERROR_KEYS])
      : (error.serverMessage ?? t('errors.INTERNAL_ERROR'));
}
