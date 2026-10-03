import { getTranslations } from 'next-intl/server';
import { EmptyState } from '../../components/shared/EmptyState';
export default async function Forbidden(): Promise<React.JSX.Element> {
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-2xl p-6 py-20">
      <EmptyState title={t('common.forbidden')} description={t('common.forbiddenDescription')} />
    </main>
  );
}
