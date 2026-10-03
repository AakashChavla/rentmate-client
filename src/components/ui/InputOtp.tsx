'use client';
import { OTPInput, OTPInputContext } from 'input-otp';
import { useContext, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';
export function InputOTP(props: ComponentProps<typeof OTPInput>): React.JSX.Element {
  return <OTPInput containerClassName={OTP_CONTAINER_CLASS} {...props} />;
}
export function InputOTPSlot({ index }: { index: number }): React.JSX.Element {
  const context = useContext(OTPInputContext);
  const slot = context.slots[index];
  return (
    <div
      className={cn(
        'flex h-12 w-10 items-center justify-center rounded-xl border border-border text-lg',
        slot?.isActive && 'ring-2 ring-primary',
      )}
    >
      {slot?.char}
      {slot?.hasFakeCaret ? (
        <span className="h-5 w-px animate-pulse bg-foreground" aria-hidden />
      ) : null}
    </div>
  );
}

const OTP_CONTAINER_CLASS = 'flex gap-2';
