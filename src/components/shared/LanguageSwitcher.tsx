'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, STORAGE_KEYS } from '../../config/app.constants';
import { useServices } from '../../providers/ServicesProvider';
export function LanguageSwitcher(): React.JSX.Element {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { preferences } = useServices();
  return (
    <label className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>{t('common.language')}</span>
      <select
        aria-label={t('common.language')}
        value={locale}
        className="rounded-lg border border-slate-300 bg-background px-3 py-2 text-foreground"
        onChange={(event) => {
          preferences.set(STORAGE_KEYS.LOCALE, event.target.value);
          router.refresh();
        }}
      >
        <option value={SUPPORTED_LOCALES[0]}>{t('common.english')}</option>
        <option value={SUPPORTED_LOCALES[1]}>{t('common.hindi')}</option>
      </select>
    </label>
  );
}
