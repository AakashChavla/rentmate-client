'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { m, useReducedMotion } from 'motion/react';
import { Check, Building2, Mail } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { useCan } from '../../auth';
import { Button } from '../../../components/ui/Button';
import {
  DOMAIN_ROUTE,
  DOMAIN_PERMISSION,
  ONBOARDING_KEY,
  RING,
  SVG_FILL,
} from '../../../config/property.constants';
import { MOTION } from '../../../config/motion';
type useOnboardingDashboardStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  auth: ReturnType<typeof useAuth>;
  reduced: boolean | null;
  create: boolean;
  steps: { key: string; done: boolean }[];
  done: number;
  progress: number;
  circumference: number;
};
function useOnboardingDashboardState(): useOnboardingDashboardStateContract {
  const t = useTranslations();
  const auth = useAuth();
  const reduced = useReducedMotion();
  const create = useCan(DOMAIN_PERMISSION.CREATE);
  const steps = auth.onboarding.steps;
  const done = steps.filter((step) => step.done).length;
  const progress = steps.length ? done / steps.length : 0;
  const circumference = Math.PI * (RING.RADIUS + RING.RADIUS);
  return { t, auth, reduced, create, steps, done, progress, circumference };
}
export function OnboardingDashboard(): React.JSX.Element {
  const view = useOnboardingDashboardState();
  return <OnboardingDashboardView {...view} />;
}
function OnboardingDashboardView(
  view: ReturnType<typeof useOnboardingDashboardState>,
): React.JSX.Element {
  const { t, auth, steps, done } = view;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-secondary">{auth.organization?.name}</p>
        <h1 className="text-3xl font-bold">{t('common.dashboard')}</h1>
      </div>
      <section className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <ProgressRing {...view} />
          <div>
            <h2 className="text-xl font-semibold">{t('organization.onboarding')}</h2>
            <p className="mt-1 text-muted-foreground">
              {t('organization.completed', { done, total: steps.length })}
            </p>
          </div>
        </div>
        <OnboardingSteps {...view} />
      </section>
    </div>
  );
}

function ProgressRing(view: Parameters<typeof OnboardingDashboardView>[0]): React.JSX.Element {
  const { t, reduced, progress, circumference } = view;
  return (
    <svg
      width={RING.SIZE}
      height={RING.SIZE}
      viewBox={'0 0 ' + String(RING.SIZE) + ' ' + String(RING.SIZE)}
      role="progressbar"
      aria-label={t('organization.progress')}
      aria-valuemin={0}
      aria-valuemax={RING.PERCENT}
      aria-valuenow={Math.round(progress * RING.PERCENT)}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={RING.CENTER}
        cy={RING.CENTER}
        r={RING.RADIUS}
        strokeWidth={RING.STROKE}
        fill={SVG_FILL}
        className="stroke-muted"
      />
      <m.circle
        cx={RING.CENTER}
        cy={RING.CENTER}
        r={RING.RADIUS}
        strokeWidth={RING.STROKE}
        fill={SVG_FILL}
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={circumference}
        initial={false}
        animate={{ strokeDashoffset: circumference * (1 - progress) }}
        transition={{ duration: reduced ? 0 : MOTION.DURATION.COUNTER }}
      />
    </svg>
  );
}

function OnboardingSteps(view: Parameters<typeof OnboardingDashboardView>[0]): React.JSX.Element {
  const { t, create, steps } = view;
  return (
    <ul className="mt-6 space-y-3">
      {steps.map((step) => (
        <li
          key={step.key}
          className="flex items-center justify-between gap-3 rounded-xl bg-muted p-4"
        >
          <span className="flex items-center gap-3">
            {step.done ? (
              <Check aria-hidden className="size-5 text-secondary" />
            ) : step.key === ONBOARDING_KEY.PROPERTY ? (
              <Building2 aria-hidden className="size-5" />
            ) : (
              <Mail aria-hidden className="size-5" />
            )}
            {step.key === ONBOARDING_KEY.PROPERTY
              ? t('auth.createProperty')
              : t('organization.verifyEmail')}
          </span>
          {!step.done && step.key === ONBOARDING_KEY.PROPERTY && create ? (
            <Button asChild size="sm">
              <Link href={DOMAIN_ROUTE.NEW}>{t('organization.start')}</Link>
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
