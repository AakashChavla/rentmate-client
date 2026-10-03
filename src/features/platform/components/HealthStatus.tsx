'use client';
import { useTranslations } from 'next-intl';
import { useHealth } from '../hooks/use-health';
export function HealthStatus(): React.JSX.Element {
  const t = useTranslations();
  const query = useHealth();
  return (
    <span className="hidden items-center gap-2 text-xs text-muted-foreground xl:inline-flex">
      <span
        className={
          query.isSuccess ? 'h-2 w-2 rounded-full bg-success' : 'h-2 w-2 rounded-full bg-warning'
        }
        aria-hidden
      />
      {query.isPending
        ? t('common.loading')
        : query.isSuccess
          ? t('common.healthReady')
          : t('common.healthUnavailable')}
    </span>
  );
}
