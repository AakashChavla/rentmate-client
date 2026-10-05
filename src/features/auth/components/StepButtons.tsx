'use client';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/Button';
export function StepButtons({
  busy,
  ready,
  onBack,
}: {
  busy: boolean;
  ready: boolean;
  onBack: () => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onBack} disabled={busy}>
        {t('auth.back')}
      </Button>
      <Button className="flex-1" disabled={!ready || busy}>
        {t('auth.createAccount')}
      </Button>
    </div>
  );
}
