'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '../../../config/app.constants';
export function LoginLinks(): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <div className="flex justify-between text-sm">
        <Link href={ROUTES.VERIFY_OTP}>{t('auth.useOtp')}</Link>
        <Link href={ROUTES.FORGOT_PASSWORD}>{t('common.forgotPassword')}</Link>
      </div>
      <Link className="block text-center text-primary" href={ROUTES.REGISTER}>
        {t('auth.createAccount')}
      </Link>
    </>
  );
}
