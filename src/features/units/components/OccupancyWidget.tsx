'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useServices } from '../../../providers/ServicesProvider';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { useCan } from '../../auth';
import { AnimatedNumber } from '../../../components/shared/AnimatedNumber';
import { OCCUPANCY_QUERY, UNIT_PERMISSION, UNIT_LIMITS as L } from '../../../config/unit.constants';
import type { Occupancy } from '../api/units-api';
const Chart = dynamic(() => import('./OccupancyChart'), { ssr: false });
export function OccupancyWidget({
  propertyId,
}: {
  propertyId?: string | undefined;
}): React.JSX.Element {
  const selected = usePropertySelection();
  const id = propertyId ?? selected.propertyId;
  const t = useTranslations();
  const services = useServices();
  const allowed = useCan(UNIT_PERMISSION.READ, { propertyId: id });
  const query = useQuery({
    queryKey: [...OCCUPANCY_QUERY, id],
    queryFn: () => services.units.occupancy(id),
    enabled: !!id && allowed,
    retry: false,
  });
  if (!allowed) return <></>;
  if (!id) return <p>{t('unit.selectProperty')}</p>;
  if (query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (!query.data) return <p role="alert">{t('unit.loadError')}</p>;
  return <OccupancyView value={query.data} />;
}
function OccupancyView({ value }: { value: Occupancy }): React.JSX.Element {
  const t = useTranslations();
  return (
    <section
      aria-label={t('unit.occupancy')}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="text-xl font-semibold">{t('unit.occupancy')}</h2>
      <Chart occupied={value.units.occupied} total={value.units.total} />
      <Count label={t('unit.rooms')} value={value.units} />
      {value.beds.total ? <Count label={t('unit.beds')} value={value.beds} /> : null}
    </section>
  );
}
function Count({ label, value }: { label: string; value: Occupancy['units'] }): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="space-y-2">
      <h3>{label}</h3>
      <p>
        <AnimatedNumber value={value.occupied} />
        <span className="sr-only">{t('unit.occupied', value)}</span>
      </p>
      <p aria-hidden>{t('unit.occupied', value)}</p>
      <progress className="w-full" aria-label={label} value={value.percent} max={L.PERCENT} />
    </div>
  );
}
