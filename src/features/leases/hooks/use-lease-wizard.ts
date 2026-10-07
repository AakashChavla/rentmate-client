'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission } from '../../auth';
import { RENTAL_KEYS } from '../../../config/lease.constants';
import { LEASE_SCHEMA } from '../schemas/lease.schema';
import type { LeaseInput, Lease } from '../api/leases-api';
import type { Unit } from '../../units';
import { initialLease, useLeaseChoices } from './use-lease-choices';
export function useLeaseWizard(
  property: string,
  done: () => void,
  renew?: Lease,
): LeaseWizardResult {
  const [value, update] = useState<LeaseInput>(initialLease(renew));
  const [unit, setUnit] = useState<Unit | null>(null);
  const actions = useLeaseActions(value, done, renew);
  const choices = useLeaseChoices(property, value.unitId);
  const set = (next: LeaseInput): void => {
    update(next);
    actions.reset();
  };
  const choose = (next: Unit): void => {
    setUnit(next);
    set({ ...value, unitId: next.id, bedId: null, rent: next.baseRent });
  };
  return { value, set, unit, choose, ...choices, ...actions };
}
function useLeaseActions(value: LeaseInput, done: () => void, renew?: Lease): LeaseActionsResult {
  const services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [invalid, setInvalid] = useState(false),
    [available, setAvailable] = useState<boolean | null>(null);
  const parsed = (): LeaseInput | null => {
    const result = LEASE_SCHEMA.safeParse(value);
    setInvalid(!result.success);
    if (!result.success) return null;
    const { bedId, members, ...fields } = result.data;
    return { ...fields, bedId: bedId ?? null, members: members ?? [] };
  };
  const check = (): void => {
    const input = parsed();
    if (!input) return;
    void submission.run(async () => {
      setAvailable((await services.leases.available(input)).available);
    });
  };
  const save = (): void => {
    const input = parsed();
    if (!input) return;
    void submission.run(async () => {
      if (renew) await services.leases.renew(renew.id, input);
      else await services.leases.create(input);
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.leases });
      done();
    });
  };
  return {
    invalid,
    available,
    check,
    save,
    submission,
    reset: (): void => {
      setAvailable(null);
    },
  };
}

type LeaseWizardResult = {
  value: LeaseInput;
  set: (next: LeaseInput) => void;
  unit: Unit | null;
  choose: (next: Unit) => void;
} & ReturnType<typeof useLeaseChoices> &
  ReturnType<typeof useLeaseActions>;

type LeaseActionsResult = {
  invalid: boolean;
  available: boolean | null;
  check: () => void;
  save: () => void;
  submission: ReturnType<typeof useAuthSubmission>;
  reset: () => void;
};
