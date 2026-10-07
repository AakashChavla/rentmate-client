'use client';
import { useTranslations } from 'next-intl';
import { InputField } from '../../../components/ui/FormField';
import type { LeaseInput } from '../api/leases-api';
export function LeaseFields({
  value,
  set,
}: {
  value: LeaseInput;
  set: (v: LeaseInput) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <LeaseDates value={value} set={set} />
      <LeaseMoney value={value} set={set} />
      <LeaseMembers value={value} set={set} />
    </div>
  );
}
function LeaseDates({
  value,
  set,
}: {
  value: LeaseInput;
  set: (v: LeaseInput) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InputField
        type="date"
        label={t('rental.startDate')}
        value={value.startDate}
        onChange={(e) => {
          set({ ...value, startDate: e.target.value });
        }}
        required
      />
      <InputField
        type="date"
        label={t('rental.endDate')}
        value={value.endDate}
        onChange={(e) => {
          set({ ...value, endDate: e.target.value });
        }}
        required
      />
    </div>
  );
}
function LeaseMoney({
  value,
  set,
}: {
  value: LeaseInput;
  set: (v: LeaseInput) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <InputField
        label={t('rental.rent')}
        inputMode="decimal"
        value={value.rent}
        onChange={(e) => {
          set({ ...value, rent: e.target.value });
        }}
        required
      />
      <InputField
        label={t('rental.deposit')}
        inputMode="decimal"
        value={value.deposit}
        onChange={(e) => {
          set({ ...value, deposit: e.target.value });
        }}
        required
      />
      <InputField
        label={t('rental.dueDay')}
        type="number"
        value={value.dueDay}
        onChange={(e) => {
          set({ ...value, dueDay: Number(e.target.value) });
        }}
        required
      />
    </div>
  );
}
function LeaseMembers({
  value,
  set,
}: {
  value: LeaseInput;
  set: (v: LeaseInput) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <label className="block">
      {t('rental.members')}
      <textarea
        className="mt-2 block w-full rounded-xl border bg-surface p-3"
        value={value.members?.join('\n') ?? ''}
        onChange={(e) => {
          set({ ...value, members: e.target.value.split('\n').filter((v) => v.trim()) });
        }}
      />
    </label>
  );
}
