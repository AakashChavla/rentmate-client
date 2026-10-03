import { useTranslations } from 'next-intl';
import { Badge } from '../ui/Badge';
import { STATUS_LABELS } from '../../config/status.constants';
export function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }): React.JSX.Element {
  const t = useTranslations();
  return (
    <Badge className={STATUS_LABELS[status].className}>{t(STATUS_LABELS[status].label)}</Badge>
  );
}
