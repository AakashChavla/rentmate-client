'use client';
import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPSlot } from '../../../components/ui/InputOtp';
import { AUTH_LIMITS } from '../../../config/auth.constants';
export function OtpCodeInput({
  code,
  onChange,
  onComplete,
  disabled = false,
}: {
  code: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {t('auth.verificationCode')}
      </label>
      <InputOTP
        id={id}
        aria-label={t('auth.verificationCode')}
        autoComplete="one-time-code"
        maxLength={AUTH_LIMITS.OTP_DIGITS}
        pattern={REGEXP_ONLY_DIGITS}
        value={code}
        onChange={onChange}
        {...(onComplete ? { onComplete } : {})}
        disabled={disabled}
      >
        <div className="flex gap-2">
          {Array.from({ length: AUTH_LIMITS.OTP_DIGITS }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </div>
      </InputOTP>
    </div>
  );
}
