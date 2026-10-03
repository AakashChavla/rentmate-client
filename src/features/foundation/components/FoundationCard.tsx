import { Building2, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PropertyIllustration } from './PropertyIllustration';
export async function FoundationCard(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-background p-8 shadow-xl shadow-indigo-100/40 dark:border-slate-700 dark:shadow-none">
      <div className="mb-8 flex items-center justify-between">
        <Building2 aria-hidden className="h-8 w-8 text-primary" />
        <CheckCircle2 aria-hidden className="h-6 w-6 text-teal-600" />
      </div>
      <PropertyIllustration />
      <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
        {t('common.ready')}
      </p>
    </div>
  );
}
