'use client';
import { useTranslations } from 'next-intl';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../../../config/app.constants';
export function LocaleSelect({
  value,
  onChange,
}: {
  value: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <label className="flex flex-col gap-2">
      <span>{t('auth.language')}</span>
      <select
        className="rounded-xl border border-border bg-background p-3"
        value={value}
        onChange={(event) => {
          onChange(event.target.value as SupportedLocale);
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {locale === SUPPORTED_LOCALES[0] ? t('common.english') : t('common.hindi')}
          </option>
        ))}
      </select>
    </label>
  );
}
