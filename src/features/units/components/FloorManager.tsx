'use client';
import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice, useCan } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { FLOOR_QUERY, UNIT_QUERY, UNIT_PERMISSION as P } from '../../../config/unit.constants';
import type { Floor, FloorInput } from '../api/units-api';
export function FloorManager({ property }: { property: string }): React.JSX.Element {
  const services = useServices();
  const query = useQuery({
    queryKey: [...FLOOR_QUERY, property],
    queryFn: () => services.units.floors(property),
  });
  const [selected, set] = useState<Floor | undefined>();
  return (
    <div className="space-y-4">
      <FloorForm
        key={selected?.id ?? property}
        property={property}
        floor={selected}
        done={() => {
          set(undefined);
        }}
      />
      {query.data?.map((floor) => (
        <FloorRow
          key={floor.id}
          floor={floor}
          edit={() => {
            set(floor);
          }}
        />
      ))}
    </div>
  );
}
type useFloorFormStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  submission: ReturnType<typeof useAuthSubmission>;
  property: string;
  floor: Floor | undefined;
  done: () => void;
  allowed: boolean;
  value: FloorInput;
  set: Dispatch<SetStateAction<FloorInput>>;
};
function useFloorFormState({
  property,
  floor,
  done,
}: {
  property: string;
  floor?: Floor | undefined;
  done: () => void;
}): useFloorFormStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const allowed = useCan(floor ? P.UPDATE : P.CREATE, { propertyId: property });
  const [value, set] = useState<FloorInput>({
    name: floor?.name ?? '',
    level: floor?.level ?? 1,
    wing: floor?.wing ?? '',
  });
  return { property, floor, done, t, services, client, submission, allowed, value, set };
}
function FloorForm({
  property,
  floor,
  done,
}: {
  property: string;
  floor?: Floor | undefined;
  done: () => void;
}): React.JSX.Element {
  return (
    <FloorFormView
      {...useFloorFormState({
        property,
        floor,
        done,
      })}
    />
  );
}
function FloorFormView(view: ReturnType<typeof useFloorFormState>): React.JSX.Element {
  const { property, floor, done, t, services, client, submission, allowed, value, set } = view;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!allowed) return;
        void submission.run(async () => {
          if (floor) await services.units.updateFloor(floor.id, value);
          else await services.units.createFloor(property, value);
          await client.invalidateQueries({ queryKey: FLOOR_QUERY });
          await client.invalidateQueries({ queryKey: UNIT_QUERY });
          done();
        });
      }}
    >
      <InputField
        required
        label={t('unit.floorName')}
        value={value.name}
        onChange={(e) => {
          set({ ...value, name: e.target.value });
        }}
      />
      <InputField
        label={t('unit.level')}
        type="number"
        value={value.level}
        onChange={(e) => {
          set({ ...value, level: Number(e.target.value) });
        }}
      />
      <InputField
        label={t('unit.wing')}
        value={value.wing ?? ''}
        onChange={(e) => {
          set({ ...value, wing: e.target.value });
        }}
      />
      <Button disabled={!allowed || submission.busy}>{t('auth.save')}</Button>
      <AuthErrorNotice {...submission} />
    </form>
  );
}

function FloorRow({ floor, edit }: { floor: Floor; edit: () => void }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const update = useCan(P.UPDATE, { propertyId: floor.propertyId });
  const remove = useCan(P.DELETE, { propertyId: floor.propertyId });
  return (
    <div className="rounded border p-3">
      <p>
        {floor.wing} {floor.name}
      </p>
      {update ? (
        <Button variant="outline" onClick={edit}>
          {t('unit.edit')}
        </Button>
      ) : null}
      {remove ? (
        <Button
          variant="outline"
          disabled={submission.busy}
          onClick={() => {
            void submission.run(async () => {
              await services.units.removeFloor(floor.id);
              await client.invalidateQueries({ queryKey: FLOOR_QUERY });
            });
          }}
        >
          {t('unit.delete')}
        </Button>
      ) : null}
      <AuthErrorNotice {...submission} />
    </div>
  );
}
