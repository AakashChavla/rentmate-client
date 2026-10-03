import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { InputField } from '../../../components/ui/FormField';
import { Badge } from '../../../components/ui/Badge';
import { ROUTES } from '../../../config/app.constants';
import type { I18nKey } from '../../../lib/i18n/generated/i18n.generated';
export async function AuthPlaceholder({ title }: { title: I18nKey }): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <>
      <Badge className="mb-5 self-start">{t('common.formComingSoon')}</Badge>
      <h1 className="font-display text-3xl font-bold">{t(title)}</h1>
      <p className="mb-8 mt-3 text-sm leading-relaxed text-muted-foreground">
        {t('common.authNote')}
      </p>
      <div className="space-y-5">
        <InputField label={t('common.email')} type="email" disabled autoComplete="email" />
        <InputField
          label={t('common.password')}
          type="password"
          disabled
          autoComplete="current-password"
        />
      </div>
      <Link className="mt-8 text-sm font-medium text-primary" href={ROUTES.HOME}>
        {t('common.backHome')}
      </Link>
    </>
  );
}
