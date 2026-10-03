'use client';
import { useTranslations } from 'next-intl';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <main className="mx-auto max-w-2xl p-6 py-20">
      <EmptyState
        title={t('common.errorTitle')}
        description={t('common.errorDescription')}
        action={<Button onClick={reset}>{t('common.retry')}</Button>}
      />
    </main>
  );
}
