'use client';
import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice, useCan } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import {
  AMENITY_KEYS,
  FURNISHING_KEYS,
  UNIT_QUERY,
  UNIT_PERMISSION,
} from '../../../config/unit.constants';
import type { Unit, UnitConfig } from '../api/units-api';
export function UnitConfigForm({ unit }: { unit: Unit }): React.JSX.Element {
  const services = useServices();
  const query = useQuery({
    queryKey: [...UNIT_QUERY, unit.id, 'config'],
    queryFn: () => services.units.config(unit.id),
  });
  return query.data ? <ConfigForm unit={unit} initial={query.data} /> : <></>;
}
type useConfigFormStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  submission: ReturnType<typeof useAuthSubmission>;
  unit: Unit;
  initial: UnitConfig;
  allowed: boolean;
  value: UnitConfig;
  set: Dispatch<SetStateAction<UnitConfig>>;
};
function useConfigFormState({
  unit,
  initial,
}: {
  unit: Unit;
  initial: UnitConfig;
}): useConfigFormStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const allowed = useCan(UNIT_PERMISSION.UPDATE, { propertyId: unit.propertyId });
  const [value, set] = useState(initial);
  return { unit, initial, t, services, client, submission, allowed, value, set };
}
function ConfigForm({ unit, initial }: { unit: Unit; initial: UnitConfig }): React.JSX.Element {
  return <ConfigFormView {...useConfigFormState({ unit, initial })} />;
}
function ConfigFormView(view: ReturnType<typeof useConfigFormState>): React.JSX.Element {
  const { unit, t, services, client, submission, allowed, value, set } = view;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!allowed) return;
        void submission.run(async () => {
          await services.units.setConfig(unit.id, value);
          await client.invalidateQueries({ queryKey: [...UNIT_QUERY, unit.id, 'config'] });
        });
      }}
    >
      <h3>{t('unit.configuration')}</h3>
      <fieldset disabled={!allowed || submission.busy}>
        <legend>{t('unit.amenities')}</legend>
        <AmenityFields value={value} set={set} />
        <InputField
          label={t('unit.size')}
          inputMode="decimal"
          value={value.size ?? ''}
          onChange={(e) => {
            set({ ...value, size: e.target.value || null });
          }}
        />
        <label>
          {t('unit.furnishing')}
          <select
            value={value.furnishing}
            onChange={(e) => {
              set({ ...value, furnishing: e.target.value as UnitConfig['furnishing'] });
            }}
          >
            {Object.keys(FURNISHING_KEYS).map((key) => (
              <option key={key} value={key}>
                {t(FURNISHING_KEYS[key as UnitConfig['furnishing']])}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      {allowed ? <Button disabled={submission.busy}>{t('auth.save')}</Button> : null}
      <AuthErrorNotice {...submission} />
    </form>
  );
}

function AmenityFields({
  value,
  set,
}: {
  value: UnitConfig;
  set: (value: UnitConfig) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      {' '}
      <div className="flex flex-wrap gap-2">
        {Object.keys(AMENITY_KEYS).map((key) => {
          const amenity = key as UnitConfig['amenities'][number];
          return (
            <label key={key} className="rounded-full border p-2 text-sm">
              <input
                type="checkbox"
                checked={value.amenities.includes(amenity)}
                onChange={(e) => {
                  set({
                    ...value,
                    amenities: e.target.checked
                      ? [...value.amenities, amenity]
                      : value.amenities.filter((a) => a !== amenity),
                  });
                }}
              />
              {t(AMENITY_KEYS[amenity])}
            </label>
          );
        })}
      </div>
    </>
  );
}
