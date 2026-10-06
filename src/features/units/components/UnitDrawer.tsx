'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useCan, useAuthSubmission, AuthErrorNotice } from '../../auth';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../../../components/ui/Sheet';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { UNIT_PERMISSION as P, UNIT_QUERY, OCCUPANCY_QUERY } from '../../../config/unit.constants';
import type { Unit } from '../api/units-api';
import { useUnitStatus } from '../hooks/use-unit-status';
import { StatusSelect } from './StatusSelect';
import { UnitForm } from './UnitForm';
import { UnitConfigForm } from './UnitConfigForm';
import { BedManager } from './BedManager';
export function UnitDrawer({
  unit,
  change,
}: {
  unit: Unit | null;
  change: (unit: Unit | null) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <Sheet
      open={!!unit}
      onOpenChange={(open) => {
        if (!open) change(null);
      }}
    >
      <SheetContent className="w-full max-w-xl overflow-y-auto">
        <SheetTitle>{unit?.code}</SheetTitle>
        <SheetDescription>{t('unit.configuration')}</SheetDescription>
        {unit ? <UnitContent key={unit.id} unit={unit} change={change} /> : null}
      </SheetContent>
    </Sheet>
  );
}
function UnitContent({
  unit,
  change,
}: {
  unit: Unit;
  change: (unit: Unit | null) => void;
}): React.JSX.Element {
  const update = useCan(P.UPDATE, { propertyId: unit.propertyId });
  const remove = useCan(P.DELETE, { propertyId: unit.propertyId });
  const status = useUnitStatus(unit, change);
  return (
    <div className="mt-5 space-y-6">
      <StatusSelect
        value={unit.status}
        disabled={!update || status.busy}
        onChange={status.setStatus}
      />
      <AuthErrorNotice {...status} />
      {update ? (
        <UnitForm
          property={unit.propertyId}
          unit={unit}
          done={() => {
            change(null);
          }}
        />
      ) : (
        <p>{unit.baseRent}</p>
      )}
      <UnitConfigForm unit={unit} />
      <BedManager unit={unit} />
      {remove ? (
        <UnitDelete
          unit={unit}
          done={() => {
            change(null);
          }}
        />
      ) : null}
    </div>
  );
}
function UnitDelete({ unit, done }: { unit: Unit; done: () => void }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const [open, set] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          set(true);
        }}
      >
        {t('unit.delete')}
      </Button>
      <AuthErrorNotice {...submission} />
      <ConfirmDialog
        open={open}
        onOpenChange={set}
        title={t('unit.delete')}
        description={t('unit.deleteHint')}
        pending={submission.busy}
        onConfirm={() => {
          void submission.run(async () => {
            await services.units.remove(unit.id);
            await client.invalidateQueries({ queryKey: UNIT_QUERY });
            await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
            done();
          });
        }}
      />
    </>
  );
}
