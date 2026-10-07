'use client';
import { useTranslations } from 'next-intl';
import { InputField } from '../../../components/ui/FormField';
import type { TenantInput } from '../api/tenants-api';
export function TenantFields({
  value,
  set,
}: {
  value: TenantInput;
  set: (value: TenantInput) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InputField
        label={t('rental.fullName')}
        value={value.fullName}
        onChange={(e) => {
          set({ ...value, fullName: e.target.value });
        }}
        required
      />
      <InputField
        label={t('rental.phone')}
        type="tel"
        value={value.phone}
        onChange={(e) => {
          set({ ...value, phone: e.target.value });
        }}
        required
      />
      <InputField
        label={t('rental.email')}
        type="email"
        value={value.email}
        onChange={(e) => {
          set({ ...value, email: e.target.value });
        }}
        required
      />
      <TenantSensitiveFields value={value} set={set} />
    </div>
  );
}
function TenantSensitiveFields({
  value,
  set,
}: {
  value: TenantInput;
  set: (value: TenantInput) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <InputField
        label={t('rental.emergency')}
        value={value.emergencyContact ?? ''}
        onChange={(e) => {
          set({ ...value, emergencyContact: e.target.value });
        }}
      />
      <InputField
        label={t('rental.idNumber')}
        type="password"
        autoComplete="off"
        value={value.idNumber ?? ''}
        onChange={(e) => {
          const fields = { ...value };
          delete fields.idNumber;
          set(e.target.value ? { ...fields, idNumber: e.target.value } : fields);
        }}
      />
    </>
  );
}
