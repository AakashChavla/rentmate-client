import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../config/app.constants';
export default async function NotFound(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-2xl p-6 py-20">
      <EmptyState
        title={t('common.notFound')}
        description={t('common.notFoundDescription')}
        action={
          <Button asChild>
            <Link href={ROUTES.HOME}>{t('common.backHome')}</Link>
          </Button>
        }
      />
    </main>
  );
}
