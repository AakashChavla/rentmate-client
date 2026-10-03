import { Building2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ICON_SIZES, ROUTES } from '../../../config/app.constants';
import { LanguageSwitcher } from '../../../components/shared/LanguageSwitcher';
export async function FoundationHeader(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <header className="flex flex-wrap items-center justify-between gap-6">
      <a
        href={ROUTES.HOME}
        className="flex items-center gap-3 text-xl font-semibold tracking-tight"
      >
        <span className="rounded-xl bg-primary p-2 text-primary-foreground">
          <Building2 aria-hidden size={ICON_SIZES.BRAND} />
        </span>
        {t('common.brand')}
      </a>
      <LanguageSwitcher />
    </header>
  );
}
