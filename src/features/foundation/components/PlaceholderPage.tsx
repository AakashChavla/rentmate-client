import { getTranslations } from 'next-intl/server';
import { PageHeader } from '../../../components/shared/PageHeader';
import { EmptyState } from '../../../components/shared/EmptyState';
import { PageTransition } from '../../../components/shared/PageTransition';
import type { I18nKey } from '../../../lib/i18n/generated/i18n.generated';
export async function PlaceholderPage({ title }: { title: I18nKey }): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <PageTransition>
      <PageHeader title={t(title)} />
      <EmptyState title={t('common.comingSoon')} description={t('common.comingSoonDescription')} />
    </PageTransition>
  );
}
