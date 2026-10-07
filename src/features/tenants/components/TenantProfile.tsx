'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { RENTAL_KEYS } from '../../../config/lease.constants';
import type { Tenant } from '../api/tenants-api';
import { TenantDetail } from './TenantDetail';
export function TenantProfile(): React.JSX.Element {
  const t = useTranslations(),
    services = useServices();
  const query = useQuery({
    queryKey: [...RENTAL_KEYS.tenants, 'own'],
    queryFn: () => services.tenants.list({}),
  });
  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-bold">{t('rental.profile')}</h1>
      {query.data?.data.map((row) => (
        <section key={row.id} className="space-y-5">
          <ProfileEditor row={row} />
          <TenantDetail id={row.id} />
        </section>
      ))}
      {query.isError ? (
        <p role="alert">{t('errors.INTERNAL_ERROR')}</p>
      ) : !query.isLoading && !query.data?.data.length ? (
        <p>{t('rental.noTenant')}</p>
      ) : null}
    </main>
  );
}
function ProfileEditor({ row }: { row: Tenant }): React.JSX.Element {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [phone, setPhone] = useState(row.phone),
    [emergency, setEmergency] = useState(row.emergencyContact ?? '');
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submission.run(async () => {
          await services.tenants.update(row.id, { phone, emergencyContact: emergency });
          await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenant(row.id) });
        });
      }}
    >
      <InputField
        label={t('rental.phone')}
        type="tel"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
        }}
        required
      />
      <InputField
        label={t('rental.emergency')}
        value={emergency}
        onChange={(e) => {
          setEmergency(e.target.value);
        }}
      />
      <AuthErrorNotice {...submission} />
      <Button disabled={submission.busy}>{t('rental.save')}</Button>
    </form>
  );
}
