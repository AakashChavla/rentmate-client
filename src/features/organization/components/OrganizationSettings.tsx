'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { useCan, useAuthSubmission, AuthErrorNotice } from '../../auth';
import { SUPPORTED_LOCALES, STORAGE_KEYS } from '../../../config/app.constants';
import {
  DOMAIN_QUERY,
  DOMAIN_PERMISSION,
  PROPERTY_LIMITS,
} from '../../../config/property.constants';
import type { Organization } from '../api/organization-api';
import { z } from 'zod';
const schema = z.object({
  name: z.string().trim().min(1).max(PROPERTY_LIMITS.NAME),
  timezone: z
    .string()
    .min(1)
    .max(PROPERTY_LIMITS.TIMEZONE)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }),
  defaultLocale: z.enum(SUPPORTED_LOCALES),
});
export function OrganizationSettings(): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const query = useQuery({
    queryKey: DOMAIN_QUERY.ORG,
    queryFn: () => services.organization.get(),
    retry: false,
  });
  if (query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (!query.data) return <p role="alert">{t('organization.loadError')}</p>;
  return <OrganizationForm key={query.data.id} initial={query.data} />;
}
type useOrganizationFormStateContract = {
  initial: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    defaultLocale: 'en' | 'hi';
    settings: { [key: string]: unknown };
    isActive: boolean;
  };
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  auth: ReturnType<typeof useAuth>;
  allowed: boolean;
  submission: ReturnType<typeof useAuthSubmission>;
  value: { name: string; timezone: string; defaultLocale: 'en' | 'hi' };
  set: React.Dispatch<
    React.SetStateAction<{ name: string; timezone: string; defaultLocale: 'en' | 'hi' }>
  >;
  invalid: boolean;
  setInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  saved: boolean;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
};
function useOrganizationFormState({
  initial,
}: {
  initial: Organization;
}): useOrganizationFormStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const auth = useAuth();
  const allowed = useCan(DOMAIN_PERMISSION.ORG_UPDATE);
  const submission = useAuthSubmission();
  const [value, set] = useState({
    name: initial.name,
    timezone: initial.timezone,
    defaultLocale: initial.defaultLocale,
  });
  const [invalid, setInvalid] = useState(false);
  const [saved, setSaved] = useState(false);
  return {
    initial,
    t,
    services,
    client,
    auth,
    allowed,
    submission,
    value,
    set,
    invalid,
    setInvalid,
    saved,
    setSaved,
  };
}
function OrganizationForm({ initial }: { initial: Organization }): React.JSX.Element {
  const view = useOrganizationFormState({ initial });
  return <OrganizationFormView {...view} />;
}
function OrganizationFormView(
  view: ReturnType<typeof useOrganizationFormState>,
): React.JSX.Element {
  const {
    t,
    services,
    client,
    auth,
    allowed,
    submission,
    value,
    invalid,
    setInvalid,
    saved,
    setSaved,
  } = view;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{t('organization.title')}</h1>
      <form
        noValidate
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = schema.safeParse(value);
          setInvalid(!parsed.success);
          if (!allowed || !parsed.success) return;
          void submission.run(async () => {
            await services.organization.update(parsed.data);
            await auth.refetch();
            await client.invalidateQueries({ queryKey: DOMAIN_QUERY.ORG });
            services.preferences.set(
              STORAGE_KEYS.LOCALE,
              auth.user?.locale ?? parsed.data.defaultLocale,
            );
            setSaved(true);
          });
        }}
      >
        <OrganizationFields {...view} />
        {invalid ? <p role="alert">{t('property.fieldError')}</p> : null}
        <AuthErrorNotice {...submission} />
        {allowed ? <Button disabled={submission.busy}>{t('auth.save')}</Button> : null}
        {saved ? <p role="status">{t('auth.saved')}</p> : null}
      </form>
    </div>
  );
}
const EN_LOCALE = 'en';

function OrganizationFields(view: Parameters<typeof OrganizationFormView>[0]): React.JSX.Element {
  const { t, allowed, submission, value, set } = view;
  return (
    <fieldset disabled={!allowed || submission.busy} className="space-y-5">
      <InputField
        label={t('organization.name')}
        value={value.name}
        onChange={(e) => {
          set({ ...value, name: e.target.value });
        }}
      />
      <InputField
        label={t('organization.timezone')}
        value={value.timezone}
        onChange={(e) => {
          set({ ...value, timezone: e.target.value });
        }}
      />
      <label className="flex flex-col gap-2">
        <span>{t('organization.language')}</span>
        <select
          className="rounded-xl border border-border bg-background p-3"
          value={value.defaultLocale}
          onChange={(e) => {
            const locale = SUPPORTED_LOCALES.find((locale) => locale === e.target.value);
            if (locale) set({ ...value, defaultLocale: locale });
          }}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {locale === EN_LOCALE ? t('common.english') : t('common.hindi')}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
