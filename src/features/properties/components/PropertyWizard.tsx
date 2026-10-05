'use client';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { usePropertyWizard } from '../hooks/use-property-wizard';
import { PropertyFields } from './PropertyFields';
import { ConfigFields } from './ConfigFields';
import { Button } from '../../../components/ui/Button';
import { AuthErrorNotice, useCan } from '../../auth';
import {
  DOMAIN_QUERY,
  DOMAIN_PERMISSION,
  WIZARD_STEP as S,
} from '../../../config/property.constants';
import type { Property, PropertyConfig } from '../api/properties-api';
export function PropertyWizard({ id }: { id?: string }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const allowed = useCan(
    id ? DOMAIN_PERMISSION.UPDATE : DOMAIN_PERMISSION.CREATE,
    id ? { propertyId: id } : {},
  );
  const query = useQuery({
    queryKey: [...DOMAIN_QUERY.PROPERTIES, id, 'edit'],
    queryFn: async () =>
      id
        ? {
            property: await services.properties.get(id),
            config: await services.properties.config(id),
          }
        : undefined,
    enabled: !!id && allowed,
    retry: false,
  });
  if (!allowed) return <p role="alert">{t('errors.FORBIDDEN')}</p>;
  if (id && query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (query.error) return <p role="alert">{t('property.loadError')}</p>;
  return <WizardForm key={id} property={query.data?.property} config={query.data?.config} />;
}
type useWizardFormStateContract = {
  property: import('../../../lib/api/schema').components['schemas']['PropertyDto'] | undefined;
  config: import('../../../lib/api/schema').components['schemas']['PropertyConfigDto'] | undefined;
  t: ReturnType<typeof useTranslations<never>>;
  v: ReturnType<typeof usePropertyWizard>;
};
function useWizardFormState({
  property,
  config,
}: {
  property?: Property | undefined;
  config?: PropertyConfig | undefined;
}): useWizardFormStateContract {
  const t = useTranslations();
  const v = usePropertyWizard(property, config);
  return { property, config, t, v };
}
function WizardForm({
  property,
  config,
}: {
  property?: Property | undefined;
  config?: PropertyConfig | undefined;
}): React.JSX.Element {
  const view = useWizardFormState({
    property,
    config,
  });
  return <WizardFormView {...view} />;
}
function WizardFormView(view: ReturnType<typeof useWizardFormState>): React.JSX.Element {
  const { property, t, v } = view;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{property ? t('property.edit') : t('property.create')}</h1>
      <WizardProgress {...view} />
      <form
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (v.step === S.CONFIG) v.save();
          else v.next();
        }}
      >
        {v.step === S.CONFIG ? (
          <ConfigFields
            type={v.fields.type}
            value={v.configuration}
            onChange={v.setConfig}
            invalid={v.invalid}
          />
        ) : (
          <PropertyFields
            value={v.fields}
            onChange={v.change}
            step={v.step}
            invalid={v.invalid}
            editing={!!property}
          />
        )}
        {v.invalid ? (
          <p role="alert" className="text-sm text-danger">
            {v.step === S.CONFIG ? t('property.configError') : t('property.fieldError')}
          </p>
        ) : null}
        <AuthErrorNotice {...v.submission} />
        <WizardActions {...view} />
      </form>
    </div>
  );
}

function WizardProgress(view: Parameters<typeof WizardFormView>[0]): React.JSX.Element {
  const { t, v } = view;
  return (
    <ol className="flex gap-3 text-sm" aria-label={t('property.steps')}>
      {[t('property.details'), t('property.location'), t('property.configuration')].map(
        (label, index) => (
          <li
            key={label}
            aria-current={index === v.step ? 'step' : undefined}
            className={index === v.step ? 'font-semibold text-primary' : 'text-muted-foreground'}
          >
            {label}
          </li>
        ),
      )}
    </ol>
  );
}

function WizardActions(view: Parameters<typeof WizardFormView>[0]): React.JSX.Element {
  const { t, v } = view;
  return (
    <div className="flex justify-between gap-3">
      <Button
        variant="outline"
        type="button"
        disabled={v.step === S.DETAILS || v.submission.busy}
        onClick={() => {
          v.setStep(v.step - 1);
        }}
      >
        {t('auth.back')}
      </Button>
      <Button disabled={v.submission.busy}>
        {v.step === S.CONFIG ? t('auth.save') : t('auth.next')}
      </Button>
    </div>
  );
}
