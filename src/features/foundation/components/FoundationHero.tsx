import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '../../../components/ui/Button';
export async function FoundationHero(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 dark:bg-teal-950 dark:text-teal-100">
        <span className="h-2 w-2 rounded-full bg-teal-600" />
        {t('common.status')}
      </div>
      <h1 className="mt-8 font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
        {t('common.title')}
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
        {t('common.subtitle')}
      </p>
      <div className="mt-9">
        <Button disabled>
          {t('common.start')}
          <ArrowUpRight aria-hidden className="ms-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
