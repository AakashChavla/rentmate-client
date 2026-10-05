'use client';
import { DOMAIN_ROUTE, DOMAIN_PERMISSION } from '../../../config/property.constants';
import { useCan } from '../hooks/use-permission';
import { m } from 'motion/react';
import { CheckCircle2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getHomeRoute } from '../../../lib/auth-policy';
import { Button } from '../../../components/ui/Button';
import { MOTION } from '../../../config/motion';
export function WelcomeStep(): React.JSX.Element {
  const t = useTranslations();
  const create = useCan(DOMAIN_PERMISSION.CREATE);
  const auth = useAuth();
  const router = useRouter();
  return (
    <div className="space-y-6 text-center">
      <m.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={MOTION.SPRING}
      >
        <CheckCircle2 aria-hidden className="mx-auto size-16 text-secondary" />
      </m.div>
      <h2 className="text-2xl font-bold">{t('auth.welcomeTitle')}</h2>
      <p>{t('auth.welcomeDescription')}</p>
      <ul className="space-y-3 text-start">
        {auth.onboarding.steps.map((step) => (
          <li key={step.key} className="flex gap-3 rounded-xl bg-muted p-3">
            <Check aria-hidden className={step.done ? 'text-secondary' : 'text-muted-foreground'} />
            {step.done ? t('auth.accountReady') : t('auth.createProperty')}
          </li>
        ))}
      </ul>
      <Button
        disabled={!create}
        onClick={() => {
          router.push(DOMAIN_ROUTE.NEW);
        }}
        className="w-full"
      >
        {t('auth.createProperty')}
      </Button>
      <Button
        className="w-full"
        onClick={() => {
          if (auth.me) {
            router.replace(getHomeRoute(auth.me));
            router.refresh();
          }
        }}
      >
        {t('auth.continueWorkspace')}
      </Button>
    </div>
  );
}
