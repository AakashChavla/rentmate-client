'use client';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission } from '../../auth';
import { UNIT_QUERY, OCCUPANCY_QUERY } from '../../../config/unit.constants';
import type { HttpResult } from '../../../lib/api/http-client';
import type { Unit } from '../api/units-api';
type Pages = InfiniteData<HttpResult<Unit[]>>;
export function useUnitStatus(
  unit: Unit,
  change: (unit: Unit) => void,
): ReturnType<typeof useAuthSubmission> & { setStatus: (status: Unit['status']) => void } {
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const setStatus = (status: Unit['status']): void => {
    void submission.run(async () => {
      await client.cancelQueries({ queryKey: UNIT_QUERY });
      const snapshots = client.getQueriesData<Pages>({ queryKey: UNIT_QUERY });
      change({ ...unit, status });
      for (const [key, data] of snapshots) {
        if (!data || !('pages' in data)) continue;
        client.setQueryData<Pages>(key, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((u) => (u.id === unit.id ? { ...u, status } : u)),
          })),
        });
      }
      try {
        change(await services.units.status(unit.id, status, unit.status));
      } catch (error) {
        for (const [key, data] of snapshots) client.setQueryData(key, data);
        change(unit);
        throw error;
      } finally {
        await client.invalidateQueries({ queryKey: UNIT_QUERY });
        await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
      }
    });
  };
  return { ...submission, setStatus };
}
