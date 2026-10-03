import { useTranslations } from 'next-intl';
import { Building2, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { DEMO } from '../../../config/landing.constants';
import { CurrencyText } from '../../../components/shared/CurrencyText';
import { AnimatedNumber } from '../../../components/shared/AnimatedNumber';
import { Badge } from '../../../components/ui/Badge';
export function PreviewHeader(): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="mb-7 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{t('common.previewName')}</p>
          <p className="text-xs text-muted-foreground">{t('common.previewOverview')}</p>
        </div>
      </div>
      <Badge>{t('common.previewDemo')}</Badge>
    </div>
  );
}
export function PreviewChart(): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs text-muted-foreground">{t('common.previewCollected')}</p>
      <p className="mt-2 font-display text-3xl font-bold">
        <CurrencyText value={DEMO.COLLECTED} />
      </p>
      <div className="mt-6 flex h-24 items-end gap-3" aria-hidden>
        {DEMO.BARS.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-lg bg-brand opacity-80"
            style={{ height: `${String(height)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
export function PreviewStats(): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">{t('common.previewOccupancy')}</p>
        <p className="mt-2 text-2xl font-bold">
          <AnimatedNumber value={DEMO.OCCUPANCY} />
          {DEMO.PERCENT}
        </p>
      </div>
      <div className="rounded-2xl bg-success/5 p-4">
        <p className="text-xs text-muted-foreground">{t('common.previewResidents')}</p>
        <p className="mt-2 text-2xl font-bold">
          <AnimatedNumber value={DEMO.RESIDENTS} />
        </p>
      </div>
    </div>
  );
}
export function PreviewTask(): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <CheckCircle2 className="h-9 w-9 shrink-0 text-success" />
      <div>
        <p className="text-sm font-semibold">{t('common.previewTask')}</p>
        <p className="text-xs text-muted-foreground">{t('common.previewTaskDescription')}</p>
      </div>
      <ArrowUpRight className="ms-2 h-4 w-4 text-muted-foreground" />
    </>
  );
}
