'use client';
import { BED_PROPERTY_TYPE, BED_UNIT_TYPE } from '../../../config/unit.constants';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice, useCan } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { BED_QUERY, OCCUPANCY_QUERY, UNIT_PERMISSION as P } from '../../../config/unit.constants';
import { StatusSelect } from './StatusSelect';
import { useBedStatus } from '../hooks/use-bed-status';
import type { Bed, Unit } from '../api/units-api';
export function BedManager({ unit }: { unit: Unit }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const property = useQuery({
    queryKey: [...BED_QUERY, unit.propertyId, 'property'],
    queryFn: () => services.properties.get(unit.propertyId),
  });
  const query = useQuery({
    queryKey: [...BED_QUERY, unit.id],
    queryFn: () => services.units.beds(unit.id),
    enabled: property.data?.type === BED_PROPERTY_TYPE && unit.type === BED_UNIT_TYPE,
  });
  const create = useCan(P.CREATE, { propertyId: unit.propertyId });
  if (property.data?.type !== BED_PROPERTY_TYPE || unit.type !== BED_UNIT_TYPE) return <></>;
  return (
    <section className="space-y-3">
      <h3>{t('unit.beds')}</h3>
      {create ? <BedCreate unit={unit} /> : null}
      {query.data?.map((bed) => (
        <BedRow key={bed.id} bed={bed} />
      ))}
    </section>
  );
}
function BedCreate({ unit }: { unit: Unit }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const [label, set] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submission.run(async () => {
          await services.units.createBed(unit.id, label);
          set('');
          await client.invalidateQueries({ queryKey: BED_QUERY });
          await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
        });
      }}
    >
      <InputField
        required
        label={t('unit.bedLabel')}
        value={label}
        onChange={(e) => {
          set(e.target.value);
        }}
      />
      <Button disabled={submission.busy}>{t('unit.addBed')}</Button>
      <AuthErrorNotice {...submission} />
    </form>
  );
}
function useBedRowState({ bed }: { bed: Bed }): {
  bed: Bed;
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  submission: ReturnType<typeof useAuthSubmission>;
  update: boolean;
  remove: boolean;
  label: string;
  set: (label: string) => void;
  run: (action: () => Promise<unknown>) => void;
  status: ReturnType<typeof useBedStatus>;
} {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const update = useCan(P.UPDATE, { propertyId: bed.propertyId });
  const remove = useCan(P.DELETE, { propertyId: bed.propertyId });
  const [label, set] = useState(bed.label);
  const status = useBedStatus(bed);
  const run = (action: () => Promise<unknown>): void => {
    void submission.run(async () => {
      await action();
      await client.invalidateQueries({ queryKey: BED_QUERY });
      await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
    });
  };
  return { bed, t, services, client, submission, update, remove, label, set, run, status };
}
function BedRow({ bed }: { bed: Bed }): React.JSX.Element {
  return <BedRowView {...useBedRowState({ bed })} />;
}
function BedRowView(view: ReturnType<typeof useBedRowState>): React.JSX.Element {
  const { bed, t, services, submission, update, remove, label, set, run, status } = view;
  return (
    <div className="space-y-2 rounded border p-3">
      <InputField
        label={t('unit.bedLabel')}
        value={label}
        disabled={!update}
        onChange={(e) => {
          set(e.target.value);
        }}
      />
      {update ? (
        <Button
          variant="outline"
          disabled={submission.busy}
          onClick={() => {
            run(() => services.units.updateBed(bed.id, label));
          }}
        >
          {t('auth.save')}
        </Button>
      ) : null}
      <StatusSelect
        value={bed.status}
        disabled={!update || submission.busy || status.busy}
        onChange={status.setStatus}
      />
      {remove ? (
        <Button
          variant="outline"
          disabled={submission.busy}
          onClick={() => {
            run(() => services.units.removeBed(bed.id));
          }}
        >
          {t('unit.delete')}
        </Button>
      ) : null}
      <AuthErrorNotice {...submission} />
      <AuthErrorNotice {...status} />
    </div>
  );
}
