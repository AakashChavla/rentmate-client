'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Building2, Hotel, House, BedDouble, Plus } from 'lucide-react';
import { useServices } from '../../../providers/ServicesProvider';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import {
  PROPERTY_TYPES,
  PROPERTY_STATUS,
  TYPE_KEYS,
  STATUS_KEYS,
  DOMAIN_QUERY,
  DOMAIN_ROUTE,
  DOMAIN_PERMISSION,
  propertyRoute,
} from '../../../config/property.constants';
import { useCan } from '../../auth';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { StaggeredList } from '../../../components/shared/StaggeredList';
import type { Property } from '../api/properties-api';
const ICONS = {
  HOTEL: Hotel,
  PG_HOSTEL: BedDouble,
  APARTMENT_COMPLEX: Building2,
  INDIVIDUAL_FLAT: House,
};
export function PropertyList(): React.JSX.Element {
  const v = usePropertyList();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-secondary">{v.t('property.portfolio')}</p>
          <h1 className="text-3xl font-bold">{v.t('common.properties')}</h1>
        </div>
        {v.create ? (
          <Button asChild>
            <Link href={DOMAIN_ROUTE.NEW}>
              <Plus aria-hidden className="size-4" />
              {v.t('property.create')}
            </Link>
          </Button>
        ) : null}
      </div>
      <PropertyFilters {...v} />
      {v.query.isPending ? (
        <p role="status">{v.t('common.loading')}</p>
      ) : v.query.error ? (
        <p role="alert">{v.t('property.loadError')}</p>
      ) : (
        <PropertyCards properties={v.query.data.pages.flatMap((page) => page.data)} />
      )}{' '}
      {v.query.hasNextPage ? (
        <Button
          variant="outline"
          disabled={v.query.isFetchingNextPage}
          onClick={() => {
            void v.query.fetchNextPage();
          }}
        >
          {v.t('property.more')}
        </Button>
      ) : null}
    </div>
  );
}
type usePropertyListContract = {
  t: ReturnType<typeof useTranslations<never>>;
  create: boolean;
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  query: import('@tanstack/react-query').UseInfiniteQueryResult<
    import('@tanstack/react-query').InfiniteData<
      import('../../../lib/api/http-client').HttpResult<
        import('../../../lib/api/schema').components['schemas']['PropertyDto'][]
      >,
      unknown
    >,
    Error
  >;
};
function usePropertyList(): usePropertyListContract {
  const t = useTranslations();
  const services = useServices();
  const selection = usePropertySelection();
  const create = useCan(DOMAIN_PERMISSION.CREATE);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const query = useInfiniteQuery({
    queryKey: [...DOMAIN_QUERY.PROPERTIES, type, status, search, selection.propertyId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.properties.list({
        type,
        status,
        search,
        propertyId: selection.propertyId || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
    retry: false,
  });
  return { t, create, type, setType, status, setStatus, search, setSearch, query };
}
function PropertyFilters(v: ReturnType<typeof usePropertyList>): React.JSX.Element {
  return (
    <div className="grid items-end gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
      <InputField
        label={v.t('property.search')}
        value={v.search}
        onChange={(e) => {
          v.setSearch(e.target.value);
        }}
      />
      <label className="flex flex-col gap-2 text-sm">
        <span>{v.t('property.type')}</span>
        <select
          className="rounded-xl border border-border bg-background p-3"
          value={v.type}
          onChange={(e) => {
            v.setType(e.target.value);
          }}
        >
          <option value="">{v.t('property.allTypes')}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {v.t(TYPE_KEYS[type])}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>{v.t('auth.status')}</span>
        <select
          className="rounded-xl border border-border bg-background p-3"
          value={v.status}
          onChange={(e) => {
            v.setStatus(e.target.value);
          }}
        >
          <option value="">{v.t('property.allStatuses')}</option>
          {Object.values(PROPERTY_STATUS).map((status) => (
            <option key={status} value={status}>
              {v.t(STATUS_KEYS[status])}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
function PropertyCards({ properties }: { properties: Property[] }): React.JSX.Element {
  const t = useTranslations();
  if (!properties.length)
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <Building2 aria-hidden className="mx-auto mb-4 size-12 text-primary" />
        <h2 className="text-xl font-semibold">{t('property.empty')}</h2>
        <p className="mt-2 text-muted-foreground">{t('property.emptyHint')}</p>
      </div>
    );
  return (
    <StaggeredList className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((p) => {
        const Icon = ICONS[p.type];
        return (
          <Link
            key={p.id}
            href={propertyRoute(p.id)}
            className="block space-y-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <div className="flex justify-between">
              <span className="rounded-xl bg-primary/10 p-3 text-primary">
                <Icon aria-hidden className="size-6" />
              </span>
              <span className="text-sm text-muted-foreground">{t(STATUS_KEYS[p.status])}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(TYPE_KEYS[p.type])}</p>
            </div>
            <p className="text-sm">
              {p.city}, {p.state}
            </p>
          </Link>
        );
      })}
    </StaggeredList>
  );
}
