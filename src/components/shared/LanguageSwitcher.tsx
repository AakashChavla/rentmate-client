'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, STORAGE_KEYS } from '../../config/app.constants';
import { useServices } from '../../providers/ServicesProvider';
import { useOptionalAuth } from '../../providers/AuthProvider';
import type { SupportedLocale } from '../../config/app.constants';
import { toast } from 'sonner';

export function LanguageSwitcher(): React.JSX.Element {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { preferences, users } = useServices();
  const auth = useOptionalAuth();
  const changeLocale = async (next: SupportedLocale): Promise<void> => {
    try {
      if (auth?.user) {
        await users.profile({ locale: next });
        await auth.refetch();
      }
      preferences.set(STORAGE_KEYS.LOCALE, next);
      router.refresh();
    } catch {
      toast.error(t('errors.INTERNAL_ERROR'));
    }
  };
  return (
    <label className="flex items-center gap-3 text-sm text-muted-foreground">
      <span>{t('common.language')}</span>
      <select
        aria-label={t('common.language')}
        value={locale}
        className="rounded-lg border border-slate-300 bg-background px-3 py-2 text-foreground"
        onChange={(event) => {
          void changeLocale(event.target.value as SupportedLocale);
        }}
      >
        <option value={SUPPORTED_LOCALES[0]}>{t('common.english')}</option>
        <option value={SUPPORTED_LOCALES[1]}>{t('common.hindi')}</option>
      </select>
    </label>
  );
}
