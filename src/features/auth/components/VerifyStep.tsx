'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/Button';
import { AUTH_LIMITS } from '../../../config/auth.constants';
import { useCountdown } from '../hooks/use-countdown';
import { OtpCodeInput } from './OtpCodeInput';
import { ResendButton } from './ResendButton';

export function VerifyStep({
  onVerify,
  onResend,
  busy,
}: {
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  busy: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  const [code, setCode] = useState('');
  const timer = useCountdown(AUTH_LIMITS.RESEND);
  const resend = async (): Promise<void> => {
    await onResend();
    timer.start(AUTH_LIMITS.RESEND);
  };
  return (
    <div className="space-y-5">
      <p className="text-muted-foreground">{t('auth.emailNeutral')}</p>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onVerify(code);
        }}
      >
        <OtpCodeInput
          code={code}
          onChange={setCode}
          onComplete={(value) => {
            void onVerify(value);
          }}
          disabled={busy}
        />
        <Button className="w-full" disabled={busy || code.length !== AUTH_LIMITS.OTP_DIGITS}>
          {t('auth.verify')}
        </Button>
      </form>
      <ResendButton remaining={timer.remaining} busy={busy} onResend={resend} />
    </div>
  );
}
