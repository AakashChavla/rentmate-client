'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission } from '../../auth';
import { BED_QUERY, OCCUPANCY_QUERY } from '../../../config/unit.constants';
import type { Bed } from '../api/units-api';
export function useBedStatus(bed: Bed): ReturnType<typeof useAuthSubmission> & {
  setStatus: (status: Bed['status']) => void;
} {
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const key = [...BED_QUERY, bed.unitId];
  const setStatus = (status: Bed['status']): void => {
    void submission.run(async () => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Bed[]>(key);
      client.setQueryData<Bed[]>(key, (rows) =>
        rows?.map((row) => (row.id === bed.id ? { ...row, status } : row)),
      );
      try {
        await services.units.bedStatus(bed.id, status, bed.status);
      } catch (error) {
        client.setQueryData(key, previous);
        throw error;
      } finally {
        await client.invalidateQueries({ queryKey: key });
        await client.invalidateQueries({ queryKey: OCCUPANCY_QUERY });
      }
    });
  };
  return { ...submission, setStatus };
}
