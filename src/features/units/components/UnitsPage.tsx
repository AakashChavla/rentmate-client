'use client';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { UNIT_STATUS, STATUS_KEYS, UNIT_TYPE, TYPE_KEYS } from '../../../config/unit.constants';
import type { Unit } from '../api/units-api';
import { UnitsGrid } from './UnitsGrid';
import { UnitForm } from './UnitForm';
import { BulkDialog } from './BulkDialog';
import { FloorManager } from './FloorManager';
import { UnitDrawer } from './UnitDrawer';
import { OccupancyWidget } from './OccupancyWidget';
const ACTION = { CREATE: 'CREATE', BULK: 'BULK', FLOORS: 'FLOORS' } as const;
export function UnitsPage(): React.JSX.Element {
  return <UnitsPageView {...useUnitsPageState()} />;
}
function UnitsPageView(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t, property } = v;
  if (!property) return <p>{t('unit.selectProperty')}</p>;
  return (
    <div className="space-y-6">
      <UnitsToolbar {...v} />
      <UnitFilters {...v} />
      <UnitsResult {...v} />
      <OccupancyWidget propertyId={property} />
      <UnitDrawer unit={v.unit} change={v.setUnit} />
      <UnitsDialog {...v} />
    </div>
  );
}
function UnitFilters(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t } = v;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label>
        {t('unit.floor')}
        <select
          value={v.floorId}
          onChange={(e) => {
            v.setFloorId(e.target.value);
          }}
        >
          <option value="">{t('unit.all')}</option>
          {v.floors.map((f) => (
            <option key={f.id} value={f.id}>
              {f.wing} {f.name}
            </option>
          ))}
        </select>
      </label>
      <InputField
        label={t('unit.search')}
        value={v.search}
        onChange={(e) => {
          v.setSearch(e.target.value);
        }}
      />
      <StatusTypeFilters {...v} />
    </div>
  );
}
function UnitsResult(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t, query } = v;
  if (query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (query.isError) return <p role="alert">{t('unit.loadError')}</p>;
  const units = query.data.pages.flatMap((p) => p.data);
  return (
    <>
      <UnitsGrid units={units} open={v.setUnit} />
      {!units.length ? <p>{t('unit.empty')}</p> : null}
      {query.hasNextPage ? (
        <Button
          disabled={query.isFetchingNextPage}
          variant="outline"
          onClick={() => {
            void query.fetchNextPage();
          }}
        >
          {t('common.loadMore')}
        </Button>
      ) : null}
    </>
  );
}

import { useUnitsPageState } from './use-units-page';

function UnitsToolbar(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t } = v;
  return (
    <>
      {' '}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{t('unit.title')}</h1>
        {v.create ? (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                v.setAction(ACTION.CREATE);
              }}
            >
              {t('unit.create')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                v.setAction(ACTION.BULK);
              }}
            >
              {t('unit.bulk')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                v.setAction(ACTION.FLOORS);
              }}
            >
              {t('unit.manageFloors')}
            </Button>
          </div>
        ) : null}
      </header>
    </>
  );
}
function UnitsDialog(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t, property } = v;
  return (
    <>
      {' '}
      <Dialog
        open={!!v.action}
        onOpenChange={(open) => {
          if (!open) v.setAction(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {v.action === ACTION.BULK
              ? t('unit.bulk')
              : v.action === ACTION.FLOORS
                ? t('unit.manageFloors')
                : t('unit.create')}
          </DialogTitle>
          <DialogDescription>{t('unit.title')}</DialogDescription>
          {v.action === ACTION.BULK ? (
            <BulkDialog property={property} />
          ) : v.action === ACTION.FLOORS ? (
            <FloorManager property={property} />
          ) : (
            <UnitForm
              property={property}
              done={() => {
                v.setAction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusTypeFilters(v: ReturnType<typeof useUnitsPageState>): React.JSX.Element {
  const { t } = v;
  return (
    <>
      {' '}
      <label>
        {t('unit.status')}
        <select
          className="ms-2 rounded border bg-background p-3"
          value={v.status}
          onChange={(e) => {
            v.setStatus(e.target.value as Unit['status'] | '');
          }}
        >
          <option value="">{t('unit.all')}</option>
          {Object.values(UNIT_STATUS).map((s) => (
            <option key={s} value={s}>
              {t(STATUS_KEYS[s])}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('unit.type')}
        <select
          className="ms-2 rounded border bg-background p-3"
          value={v.type}
          onChange={(e) => {
            v.setType(e.target.value as Unit['type'] | '');
          }}
        >
          <option value="">{t('unit.all')}</option>
          {Object.values(UNIT_TYPE).map((type) => (
            <option key={type} value={type}>
              {t(TYPE_KEYS[type])}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
