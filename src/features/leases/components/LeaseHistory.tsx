'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { RENTAL_KEYS, STATUS_MESSAGES } from '../../../config/lease.constants';
import { LeaseDetail } from './LeaseDetail';
export function LeaseHistory({
  property,
  tenant,
  readOnly = false,
}: {
  property?: string | undefined;
  tenant?: string | undefined;
  readOnly?: boolean;
}): React.JSX.Element {
  return <LeaseHistoryView {...useLeaseHistoryModel({ property, tenant, readOnly })} />;
}
function useLeaseHistoryModel({
  property,
  tenant,
  readOnly = false,
}: {
  property?: string | undefined;
  tenant?: string | undefined;
  readOnly?: boolean;
}): LeaseHistoryModelResult {
  const t = useTranslations(),
    services = useServices();
  const [selected, setSelected] = useState<string | null>(null);
  const query = useLeasePage(property, tenant, readOnly, services);
  return { t, selected, setSelected, query, readOnly };
}
function useLeasePage(
  property: string | undefined,
  tenant: string | undefined,
  readOnly: boolean,
  services: ReturnType<typeof useServices>,
): LeasePageResult {
  return useInfiniteQuery({
    queryKey: [...RENTAL_KEYS.leases, property, tenant, readOnly],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.leases.list({ propertyId: property, tenantId: tenant, cursor: pageParam }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
  });
}
function LeaseHistoryView(model: LeaseHistoryViewProps): React.JSX.Element {
  const { t, selected, setSelected, query, readOnly } = model;

  return (
    <section className="space-y-4" aria-label={t('rental.history')}>
      <h2 className="text-lg font-semibold">{t('rental.history')}</h2>
      <LeaseHistoryRows {...model} />
      {query.isError ? (
        <p role="alert">{t('errors.INTERNAL_ERROR')}</p>
      ) : query.data && !query.data.pages.some((p) => p.data.length) ? (
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
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <div className="mb-4">
            <DialogTitle>{t('rental.details')}</DialogTitle>
          </div>
          {selected ? <LeaseDetail id={selected} readOnly={readOnly} /> : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function LeaseHistoryRows(model: LeaseHistoryRowsProps): React.JSX.Element {
  const { t, setSelected, query } = model;

  return (
    <ul className="space-y-3">
      {query.data?.pages
        .flatMap((p) => p.data)
        .map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
          >
            <div>
              <p>
                {row.startDate} — {row.endDate}
              </p>
              <p>
                {t(STATUS_MESSAGES[row.status])} · {row.rent}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(row.id);
              }}
            >
              {t('rental.view')}
            </Button>
          </li>
        ))}
    </ul>
  );
}

type LeaseHistoryModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  selected: string | null;
  setSelected: React.Dispatch<React.SetStateAction<string | null>>;
  query: ReturnType<typeof useLeasePage>;
  readOnly: boolean;
};

type LeasePageResult = import('@tanstack/react-query').UseInfiniteQueryResult<
  import('@tanstack/react-query').InfiniteData<
    import('../../../lib/api/http-client').HttpResult<import('../api/leases-api').LeaseSummary[]>
  >
>;

type LeaseHistoryViewProps = ReturnType<typeof useLeaseHistoryModel>;

type LeaseHistoryRowsProps = Pick<
  ReturnType<typeof useLeaseHistoryModel>,
  't' | 'setSelected' | 'query'
>;
