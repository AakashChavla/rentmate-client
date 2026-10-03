import { useTranslations } from 'next-intl';
import { Badge } from '../ui/Badge';
export function PreviewNotice(): React.JSX.Element {
  const t = useTranslations();
  return (
    <aside className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <Badge>{t('common.preview')}</Badge>
      <p className="text-xs text-muted-foreground">{t('common.previewDescription')}</p>
    </aside>
  );
}
