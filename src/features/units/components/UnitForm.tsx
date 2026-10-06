'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import {
  TYPE_KEYS,
  UNIT_TYPE,
  UNIT_QUERY,
  FLOOR_QUERY,
  OCCUPANCY_QUERY,
} from '../../../config/unit.constants';
import { UNIT_SCHEMA } from '../schemas/unit.schema';
import type { Unit, UnitInput, Floor } from '../api/units-api';
type Props = { property: string; unit?: Unit | undefined; done: () => void };
export function UnitForm({ property, unit, done }: Props): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const [invalid, setInvalid] = useState(false);
  const [value, set] = useState<UnitInput>(initialUnit(unit));
  const floors = useQuery({
    queryKey: [...FLOOR_QUERY, property],
    queryFn: () => services.units.floors(property),
  });
  const save = (): void => {
    const parsed = UNIT_SCHEMA.safeParse(value);
    setInvalid(!parsed.success);
    if (!parsed.success) return;
    void submission.run(async () => {
      const { floorId, ...fields } = parsed.data;
      const input = { ...fields, floorId: floorId ?? null };
      if (unit) await services.units.update(unit.id, input);
      else await services.units.create(property, input);
      await client.invalidateQueries({ queryKey: UNIT_QUERY });
      await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
      done();
    });
  };
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <UnitFields value={value} set={set} floors={floors.data ?? []} />
      {invalid ? <p role="alert">{t('unit.invalid')}</p> : null}
      <AuthErrorNotice {...submission} />
      <Button disabled={submission.busy}>{t('auth.save')}</Button>
    </form>
  );
}
function UnitFields({
  value,
  set,
  floors,
}: {
  value: UnitInput;
  set: (v: UnitInput) => void;
  floors: Floor[];
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <InputField
        label={t('unit.code')}
        value={value.code}
        onChange={(e) => {
          set({ ...value, code: e.target.value });
        }}
      />
      <UnitLocation value={value} set={set} floors={floors} />
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
        min={1}
        value={value.capacity}
        onChange={(e) => {
          set({ ...value, capacity: Number(e.target.value) });
        }}
      />
    </>
  );
}

function initialUnit(unit: Unit | undefined): UnitInput {
  if (!unit)
    return { code: '', type: UNIT_TYPE.ROOM, baseRent: '0.00', capacity: 1, floorId: null };
  return {
    code: unit.code,
    type: unit.type,
    baseRent: unit.baseRent,
    capacity: unit.capacity,
    floorId: unit.floorId,
  };
}

function UnitLocation({
  value,
  set,
  floors,
}: {
  value: UnitInput;
  set: (v: UnitInput) => void;
  floors: Floor[];
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      {' '}
      <label className="block">
        {t('unit.type')}
        <select
          className="ms-2 rounded border bg-background p-2"
          value={value.type}
          onChange={(e) => {
            set({ ...value, type: e.target.value as Unit['type'] });
          }}
        >
          {Object.values(UNIT_TYPE).map((type) => (
            <option key={type} value={type}>
              {t(TYPE_KEYS[type])}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        {t('unit.floor')}
        <select
          className="ms-2 rounded border bg-background p-2"
          value={value.floorId ?? ''}
          onChange={(e) => {
            set({ ...value, floorId: e.target.value || null });
          }}
        >
          <option value="">{t('unit.noFloor')}</option>
          {floors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.wing} {f.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
