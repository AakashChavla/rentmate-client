'use client';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/Button';
export function ResendButton({
  remaining,
  busy,
  onResend,
}: {
  remaining: number;
  busy: boolean;
  onResend: () => Promise<void>;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <Button
      variant="ghost"
      onClick={() => {
        void onResend();
      }}
      disabled={busy || !!remaining}
    >
      {remaining ? t('auth.resendCountdown', { seconds: remaining }) : t('auth.resend')}
    </Button>
  );
}
