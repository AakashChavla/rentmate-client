'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { RENTAL_KEYS, RENTAL_STATE as S, RENTAL_DEFAULT } from '../../../config/lease.constants';
import type { LeaseInput, Lease } from '../api/leases-api';
export function initialLease(renew?: Lease): LeaseInput {
  if (renew)
    return {
      tenantId: renew.tenantId,
      unitId: renew.unitId,
      bedId: renew.bedId,
      startDate: renew.endDate,
      endDate: '',
      rent: renew.rent,
      deposit: renew.deposit,
      dueDay: renew.dueDay,
      members: renew.members,
    };
  return {
    tenantId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    rent: '0.00',
    deposit: '0.00',
    dueDay: RENTAL_DEFAULT.DUE_DAY,
    members: [],
  };
}
export function useLeaseChoices(property: string, unit: string): LeaseChoicesResult {
  const services = useServices();
  const tenants = useQuery({
    queryKey: [...RENTAL_KEYS.tenants, property, S.VERIFIED],
    queryFn: () => services.tenants.list({ propertyId: property, status: S.VERIFIED }),
  });
  const units = useInfiniteQuery({
    queryKey: ['lease-unit-picker', property],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => services.units.list({ propertyId: property, cursor: pageParam }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
  });
  const beds = useQuery({
    queryKey: ['lease-bed-picker', unit],
    queryFn: () => services.units.beds(unit),
    enabled: !!unit,
    retry: false,
  });
  return {
    tenants: tenants.data?.data ?? [],
    units: units.data?.pages.flatMap((p) => p.data) ?? [],
    beds: beds.data ?? [],
    more: (): void => {
      void units.fetchNextPage();
    },
    hasMore: units.hasNextPage,
  };
}

type LeaseChoicesResult = {
  tenants: import('../../tenants').Tenant[];
  units: import('../../units').Unit[];
  beds: Awaited<ReturnType<ReturnType<typeof useServices>['units']['beds']>>;
  more: () => void;
  hasMore: boolean;
};
