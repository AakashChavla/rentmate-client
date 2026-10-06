'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { BulkJob } from '../api/units-api';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import {
  UNIT_QUERY,
  FLOOR_QUERY,
  OCCUPANCY_QUERY,
  UNIT_TYPE,
  BULK_STATUS,
  UNIT_LIMITS as L,
} from '../../../config/unit.constants';
import { TypeSelect } from './TypeSelect';
import { BULK_SCHEMA, bulkPreview } from '../schemas/unit.schema';
import type { BulkPattern } from '../api/units-api';
type useBulkDialogStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  submission: ReturnType<typeof useAuthSubmission>;
  property: string;
  invalid: boolean;
  setInvalid: Dispatch<SetStateAction<boolean>>;
  job: string | null;
  setJob: Dispatch<SetStateAction<string | null>>;
  created: number | null;
  setCreated: Dispatch<SetStateAction<number | null>>;
  value: BulkPattern;
  set: Dispatch<SetStateAction<BulkPattern>>;
  query: ReturnType<typeof useQuery<BulkJob>>;
  save: () => void;
};
function useBulkDialogState({ property }: { property: string }): useBulkDialogStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const [invalid, setInvalid] = useState(false);
  const [job, setJob] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);
  const [value, set] = useState<BulkPattern>(INITIAL_BULK);
  const query = useBulkJob(property, job, setCreated);
  const save = (): void => {
    const parsed = BULK_SCHEMA.safeParse(value);
    setInvalid(!parsed.success);
    if (!parsed.success) return;
    setCreated(null);
    setJob(null);
    void submission.run(async () => {
      const result = await services.units.bulk(property, parsed.data);
      setJob(result.jobId);
      if (!result.jobId) {
        setCreated(result.createdCount);
        await client.invalidateQueries({ queryKey: UNIT_QUERY });
        await client.invalidateQueries({ queryKey: FLOOR_QUERY });
        await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
      }
    });
  };
  return {
    property,
    t,
    services,
    client,
    submission,
    invalid,
    setInvalid,
    job,
    setJob,
    created,
    setCreated,
    value,
    set,
    query,
    save,
  };
}
export function BulkDialog({ property }: { property: string }): React.JSX.Element {
  return <BulkDialogView {...useBulkDialogState({ property })} />;
}
function BulkDialogView(view: ReturnType<typeof useBulkDialogState>): React.JSX.Element {
  const { t, submission, invalid, job, created, value, set, query, save } = view;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <BulkFields value={value} set={set} />
      <h3>{t('unit.preview')}</h3>
      <p>{t('unit.count', { count: value.floors * value.perFloor })}</p>
      <p className="font-mono text-sm">{bulkPreview(value).join(', ')}</p>
      {invalid ? <p role="alert">{t('unit.invalid')}</p> : null}
      <AuthErrorNotice {...submission} />
      <BulkProgress job={query.data} queued={!!job} created={created} />
      <Button
        disabled={
          submission.busy ||
          (!!job &&
            query.data?.status !== BULK_STATUS.COMPLETED &&
            query.data?.status !== BULK_STATUS.FAILED)
        }
      >
        {t('unit.bulk')}
      </Button>
    </form>
  );
}

function BulkFields({
  value,
  set,
}: {
  value: BulkPattern;
  set: (value: BulkPattern) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <BulkNumbers value={value} set={set} />
      <TypeSelect
        value={value.type}
        onChange={(type) => {
          set({ ...value, type });
        }}
      />
      <InputField
        label={t('unit.prefix')}
        value={value.prefix}
        onChange={(e) => {
          set({ ...value, prefix: e.target.value });
        }}
      />
      <InputField
        label={t('unit.wing')}
        value={value.wing}
        onChange={(e) => {
          set({ ...value, wing: e.target.value });
        }}
      />
      <InputField
        label={t('unit.rent')}
        inputMode="decimal"
        value={value.baseRent}
        onChange={(e) => {
          set({ ...value, baseRent: e.target.value });
        }}
      />
      <InputField
        label={t('unit.capacity')}
        type="number"
        value={value.capacity}
        onChange={(e) => {
          set({ ...value, capacity: Number(e.target.value) });
        }}
      />
    </>
  );
}

function BulkNumbers({
  value,
  set,
}: {
  value: BulkPattern;
  set: (p: BulkPattern) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      {' '}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label={t('unit.floors')}
          type="number"
          value={value.floors}
          onChange={(e) => {
            set({ ...value, floors: Number(e.target.value) });
          }}
        />
        <InputField
          label={t('unit.perFloor')}
          type="number"
          value={value.perFloor}
          onChange={(e) => {
            set({ ...value, perFloor: Number(e.target.value) });
          }}
        />
        <InputField
          label={t('unit.startFloor')}
          type="number"
          value={value.startFloor}
          onChange={(e) => {
            set({ ...value, startFloor: Number(e.target.value) });
          }}
        />
        <InputField
          label={t('unit.startNumber')}
          type="number"
          value={value.startNumber}
          onChange={(e) => {
            set({ ...value, startNumber: Number(e.target.value) });
          }}
        />
      </div>
    </>
  );
}

function BulkProgress({
  job,
  queued,
  created,
}: {
  job: import('../api/units-api').BulkJob | undefined;
  queued: boolean;
  created: number | null;
}): React.JSX.Element {
  const t = useTranslations();
  if (job?.status === BULK_STATUS.FAILED) return <p role="alert">{t('unit.failed')}</p>;
  if (created !== null) return <p role="status">{t('unit.completed', { count: created })}</p>;
  return queued ? <p role="status">{t('unit.pending')}</p> : <></>;
}

function useBulkJob(
  property: string,
  job: string | null,
  setCreated: (count: number) => void,
): ReturnType<typeof useQuery<BulkJob>> {
  const services = useServices();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: [...UNIT_QUERY, property, job],
    queryFn: () => services.units.job(property, job ?? ''),
    enabled: !!job,
    refetchInterval: (q) =>
      q.state.data?.status === BULK_STATUS.COMPLETED || q.state.data?.status === BULK_STATUS.FAILED
        ? false
        : L.POLL,
    retry: false,
  });
  useEffect(() => {
    if (query.data?.status !== BULK_STATUS.COMPLETED) return;
    setCreated(query.data.createdCount);
    void client.invalidateQueries({ queryKey: UNIT_QUERY });
    void client.invalidateQueries({ queryKey: FLOOR_QUERY });
    void client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
  }, [query.data, client]);
  return query;
}

const INITIAL_BULK: BulkPattern = {
  floors: 1,
  perFloor: 1,
  prefix: 'R',
  startFloor: 1,
  startNumber: 1,
  wing: '',
  type: UNIT_TYPE.ROOM,
  baseRent: '0.00',
  capacity: 1,
};
