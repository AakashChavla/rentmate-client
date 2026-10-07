'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { usePermissionChecker } from '../../auth';
import { useAccessibleProperties } from '../../properties';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import {
  RENTAL_KEYS,
  RENTAL_PERMISSION as P,
  TENANT_STATES,
  STATUS_MESSAGES,
} from '../../../config/lease.constants';
import { TenantWizard } from './TenantWizard';
import { TenantDetail } from './TenantDetail';
import type { Tenant } from '../api/tenants-api';
export function TenantList(): React.JSX.Element {
  return <TenantListView {...useTenantListModel()} />;
}
function useTenantListModel(): TenantListModelResult {
  const t = useTranslations(),
    services = useServices(),
    can = usePermissionChecker(),
    selection = usePropertySelection(),
    properties = useAccessibleProperties();
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [creating, setCreating] = useState(false),
    [selected, setSelected] = useState<Tenant | null>(null);
  const available = properties.data?.pages.flatMap((p) => p.data) ?? [];
  const property = selection.propertyId || available[0]?.id;
  const query = useTenantPage(property, status, search, services);
  return {
    t,
    can,
    search,
    setSearch,
    status,
    setStatus,
    creating,
    setCreating,
    selected,
    setSelected,
    property,
    query,
  };
}
function useTenantPage(
  property: string | undefined,
  status: string,
  search: string,
  services: ReturnType<typeof useServices>,
): TenantPageResult {
  return useInfiniteQuery({
    queryKey: [...RENTAL_KEYS.tenants, property, status, search],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.tenants.list({ propertyId: property, status, search, cursor: pageParam }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
    enabled: !!property,
  });
}
function TenantListView(model: TenantListViewProps): React.JSX.Element {
  const { t, can, search, setSearch, status, setStatus, setCreating, property, query } = model;

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('rental.title')}</h1>
        {property && can(P.TENANT_CREATE, { propertyId: property }) ? (
          <Button
            onClick={() => {
              setCreating(true);
            }}
          >
            {t('rental.createTenant')}
          </Button>
        ) : null}
      </header>
      <TenantFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />
      {!property ? <p>{t('rental.selectProperty')}</p> : null}
      <TenantCards {...model} />
      {query.isError ? <p role="alert">{t('errors.INTERNAL_ERROR')}</p> : null}
      {query.data && !query.data.pages.some((p) => p.data.length) ? (
        <p>{t('rental.empty')}</p>
      ) : null}
      {query.hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => {
            void query.fetchNextPage();
          }}
        >
          {t('rental.more')}
        </Button>
      ) : null}
      <CreateTenantDialog {...model} />
      <TenantDetailDialog {...model} />
    </main>
  );
}
function TenantFilters({
  search,
  setSearch,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap gap-4">
      <InputField
        label={t('rental.search')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <label>
        {t('rental.status')}
        <select
          className="ms-3 rounded border bg-surface p-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }}
        >
          <option value="">{t('rental.all')}</option>
          {TENANT_STATES.map((s) => (
            <option key={s} value={s}>
              {t(STATUS_MESSAGES[s])}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
function TenantCard({ tenant, open }: { tenant: Tenant; open: () => void }): React.JSX.Element {
  const t = useTranslations();
  return (
    <article className="space-y-3 rounded-xl border p-4">
      <h2 className="font-semibold">{tenant.fullName}</h2>
      <p>{t(STATUS_MESSAGES[tenant.status])}</p>
      <p>{tenant.maskedId}</p>
      <Button variant="outline" onClick={open}>
        {t('rental.view')}
      </Button>
    </article>
  );
}

function CreateTenantDialog(model: CreateTenantDialogProps): React.JSX.Element {
  const { t, creating, setCreating, property } = model;

  return (
    <Dialog open={creating} onOpenChange={setCreating}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <div className="mb-4">
          <DialogTitle>{t('rental.createTenant')}</DialogTitle>
        </div>
        {property ? (
          <TenantWizard
            property={property}
            done={() => {
              setCreating(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TenantDetailDialog(model: TenantDetailDialogProps): React.JSX.Element {
  const { t, selected, setSelected } = model;

  return (
    <Dialog
      open={!!selected}
      onOpenChange={(v) => {
        if (!v) setSelected(null);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <div className="mb-4">
          <DialogTitle>{t('rental.details')}</DialogTitle>
        </div>
        {selected ? <TenantDetail id={selected.id} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function TenantCards(model: TenantCardsProps): React.JSX.Element {
  const { setSelected, query } = model;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {query.data?.pages
        .flatMap((p) => p.data)
        .map((tenant) => (
          <TenantCard
            key={tenant.id}
            tenant={tenant}
            open={() => {
              setSelected(tenant);
            }}
          />
        ))}
    </div>
  );
}

type TenantListModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  can: ReturnType<typeof usePermissionChecker>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  creating: boolean;
  setCreating: React.Dispatch<React.SetStateAction<boolean>>;
  selected: Tenant | null;
  setSelected: React.Dispatch<React.SetStateAction<Tenant | null>>;
  property: string | undefined;
  query: ReturnType<typeof useTenantPage>;
};

type TenantPageResult = import('@tanstack/react-query').UseInfiniteQueryResult<
  import('@tanstack/react-query').InfiniteData<
    import('../../../lib/api/http-client').HttpResult<Tenant[]>
  >
>;

type TenantListViewProps = ReturnType<typeof useTenantListModel>;

type CreateTenantDialogProps = Pick<
  ReturnType<typeof useTenantListModel>,
  't' | 'creating' | 'setCreating' | 'property'
>;

type TenantDetailDialogProps = Pick<
  ReturnType<typeof useTenantListModel>,
  't' | 'selected' | 'setSelected'
>;

type TenantCardsProps = Pick<ReturnType<typeof useTenantListModel>, 'setSelected' | 'query'>;
