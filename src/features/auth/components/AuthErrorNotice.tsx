'use client';
import { useTranslations } from 'next-intl';
export function AuthErrorNotice({
  message,
  remaining = 0,
  requestId,
}: {
  message: string | null;
  remaining?: number;
  requestId?: string | null;
}): React.JSX.Element | null {
  const t = useTranslations();
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"
    >
      <p>{message}</p>
      {remaining > 0 ? (
        <p className="mt-2 tabular-nums">{t('auth.retryCountdown', { seconds: remaining })}</p>
      ) : null}
      {requestId ? <p className="mt-2 text-xs">{t('auth.requestId', { id: requestId })}</p> : null}
    </div>
  );
}
