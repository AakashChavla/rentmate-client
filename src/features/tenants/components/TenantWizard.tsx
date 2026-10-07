'use client';
import { messageKey } from '../../../lib/i18n/message-key';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { Button } from '../../../components/ui/Button';
import { RENTAL_KEYS, ONBOARDING_STEP as S } from '../../../config/lease.constants';
import { MOTION } from '../../../config/motion';
import { TENANT_SCHEMA } from '../schemas/tenant.schema';
import type { TenantInput, Tenant } from '../api/tenants-api';
import { TenantFields } from './TenantFields';
import { DocumentUpload } from './DocumentUpload';
import { TenantDetail } from './TenantDetail';
export function TenantWizard({
  property,
  done,
}: {
  property: string;
  done: () => void;
}): React.JSX.Element {
  return <TenantWizardView {...useTenantWizardModel({ property, done })} />;
}
function useTenantWizardModel({
  property,
  done,
}: {
  property: string;
  done: () => void;
}): TenantWizardModelResult {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [step, setStep] = useState<number>(S.DETAILS),
    [tenant, setTenant] = useState<Tenant | null>(null),
    [invalid, setInvalid] = useState(false);
  const [value, setValue] = useState<TenantInput>({
    propertyId: property,
    fullName: '',
    phone: '',
    email: '',
  });
  const create = (): void => {
    const parsed = TENANT_SCHEMA.safeParse(value);
    setInvalid(!parsed.success);
    if (!parsed.success) return;
    void submission.run(async () => {
      const row = await services.tenants.create(tenantInput(parsed.data));
      setTenant(row);
      setValue({ propertyId: property, fullName: '', phone: '', email: '' });
      setStep(S.DOCUMENTS);
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenants });
    });
  };
  return { t, submission, step, setStep, tenant, invalid, value, setValue, create, done };
}
function TenantWizardView(model: TenantWizardViewProps): React.JSX.Element {
  const { t, submission, step } = model;

  return (
    <div className="space-y-5">
      <ol className="flex gap-4" aria-label={t('rental.createTenant')}>
        {[S.DETAILS, S.DOCUMENTS, S.REVIEW].map((v) => (
          <li
            key={v}
            aria-current={step === v ? 'step' : undefined}
            className={step === v ? 'font-semibold text-primary' : ''}
          >
            {t(
              v === S.DETAILS
                ? 'rental.details'
                : v === S.DOCUMENTS
                  ? 'rental.documents'
                  : messageKey('rental.review'),
            )}
          </li>
        ))}
      </ol>
      <TenantWizardStep {...model} />
      <AuthErrorNotice {...submission} />
    </div>
  );
}

function tenantInput(value: import('zod').infer<typeof TENANT_SCHEMA>): TenantInput {
  const { idNumber, emergencyContact, ...fields } = value;
  return {
    ...fields,
    ...(idNumber ? { idNumber } : {}),
    ...(emergencyContact ? { emergencyContact } : {}),
  };
}

function TenantWizardStep(model: TenantWizardStepProps): React.JSX.Element {
  const { t, submission, step, setStep, tenant, invalid, value, setValue, create, done } = model;

  return (
    <m.div
      key={step}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MOTION.DURATION.SHORT }}
    >
      {step === S.DETAILS ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
          className="space-y-4"
        >
          <TenantFields value={value} set={setValue} />
          {invalid ? <p role="alert">{t('rental.validation')}</p> : null}
          <Button disabled={submission.busy}>{t('rental.next')}</Button>
        </form>
      ) : tenant ? (
        <>
          {step === S.DOCUMENTS ? (
            <DocumentUpload tenant={tenant.id} />
          ) : (
            <TenantDetail id={tenant.id} />
          )}
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              if (step === S.DOCUMENTS) setStep(S.REVIEW);
              else done();
            }}
          >
            {t(step === S.DOCUMENTS ? 'rental.next' : messageKey('rental.finish'))}
          </Button>
        </>
      ) : null}
    </m.div>
  );
}

type TenantWizardModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  submission: ReturnType<typeof useAuthSubmission>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  tenant: Tenant | null;
  invalid: boolean;
  value: TenantInput;
  setValue: React.Dispatch<React.SetStateAction<TenantInput>>;
  create: () => void;
  done: () => void;
};

type TenantWizardViewProps = ReturnType<typeof useTenantWizardModel>;

type TenantWizardStepProps = Pick<
  ReturnType<typeof useTenantWizardModel>,
  | 't'
  | 'submission'
  | 'step'
  | 'setStep'
  | 'tenant'
  | 'invalid'
  | 'value'
  | 'setValue'
  | 'create'
  | 'done'
>;
