import { getTranslations } from 'next-intl/server';
import { Skeleton } from '../components/ui/Skeleton';
export default async function Loading(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <main
      className="mx-auto max-w-5xl space-y-8 p-8"
      role="status"
      aria-label={t('common.loading')}
    >
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </main>
  );
}
