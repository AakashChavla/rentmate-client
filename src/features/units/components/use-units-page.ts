'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import type { HttpResult } from '../../../lib/api/http-client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { useAccessibleProperties } from '../../../providers/use-accessible-properties';
import { useCan } from '../../auth';

import { UNIT_QUERY, FLOOR_QUERY, UNIT_PERMISSION as P } from '../../../config/unit.constants';
import type { Unit } from '../api/units-api';

type useUnitsPageStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  property: string;
  create: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  status: Unit['status'] | '';
  setStatus: Dispatch<SetStateAction<Unit['status'] | ''>>;
  type: Unit['type'] | '';
  setType: Dispatch<SetStateAction<Unit['type'] | ''>>;
  unit: Unit | null;
  setUnit: Dispatch<SetStateAction<Unit | null>>;
  action: string | null;
  setAction: Dispatch<SetStateAction<string | null>>;
  floorId: string;
  setFloorId: Dispatch<SetStateAction<string>>;
  floors: import('../api/units-api').Floor[];
  query: UseInfiniteQueryResult<InfiniteData<HttpResult<Unit[]>>>;
};
export function useUnitsPageState(): useUnitsPageStateContract {
  const t = useTranslations();
  const services = useServices();
  const property = useUnitsProperty();
  const create = useCan(P.CREATE, { propertyId: property });
  const [floorId, setFloorId] = useState('');
  const floors = useUnitFloors(property);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Unit['status'] | ''>('');
  const [type, setType] = useState<Unit['type'] | ''>('');
  const [unit, setUnit] = useState<Unit | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const query = useInfiniteQuery({
    queryKey: [...UNIT_QUERY, property, status, type, search, floorId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.units.list({
        propertyId: property,
        floorId: floorId || undefined,
        status: status || undefined,
        type: type || undefined,
        search,
        cursor: pageParam,
      }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
    enabled: !!property,
    retry: false,
  });
  return {
    t,
    property,
    floorId,
    setFloorId,
    floors,
    create,
    search,
    setSearch,
    status,
    setStatus,
    type,
    setType,
    unit,
    setUnit,
    action,
    setAction,
    query,
  };
}

function useUnitsProperty(): string {
  const selection = usePropertySelection();
  const properties = useAccessibleProperties();
  return selection.propertyId || properties.data?.pages[0]?.data[0]?.id || '';
}
function useUnitFloors(property: string): import('../api/units-api').Floor[] {
  const services = useServices();
  const query = useQuery({
    queryKey: [...FLOOR_QUERY, property],
    queryFn: () => services.units.floors(property),
    enabled: !!property,
  });
  return query.data ?? [];
}
