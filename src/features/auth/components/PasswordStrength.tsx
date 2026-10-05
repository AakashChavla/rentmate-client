'use client';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { AUTH_LIMITS } from '../../../config/auth.constants';
import { MOTION } from '../../../config/motion';
const STRENGTH_WEIGHT = 25;
export function PasswordStrength({ password }: { password: string }): React.JSX.Element {
  const t = useTranslations();
  const score =
    [
      password.length >= AUTH_LIMITS.PASSWORD_MIN,
      /[a-z]/.test(password) && /[A-Z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z\d]/.test(password),
    ].filter(Boolean).length * STRENGTH_WEIGHT;
  return (
    <div className="space-y-2">
      <div
        role="meter"
        aria-label={t('auth.passwordStrength')}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={AUTH_LIMITS.PERCENT}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <m.div
          className="h-full w-full origin-left bg-primary"
          animate={{ scaleX: score / AUTH_LIMITS.PERCENT }}
          transition={{ type: 'spring', ...MOTION.SPRING }}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{t('auth.passwordPolicy')}</p>
    </div>
  );
}
