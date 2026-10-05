'use client';
import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { TERMS_VERSION } from '../../../config/auth.constants';
import { MOTION } from '../../../config/motion';
import { messageKey } from '../../../lib/i18n/message-key';
import type { AccountFields } from '../schemas/account.schema';
import type { OrganizationFields } from '../schemas/organization.schema';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { AccountStep } from './AccountStep';
import { OrganizationStep } from './OrganizationStep';
import { VerifyStep } from './VerifyStep';
import { WelcomeStep } from './WelcomeStep';
import { AuthErrorNotice } from './AuthErrorNotice';
const STEP = { ACCOUNT: 0, ORGANIZATION: 1, VERIFY: 2, WELCOME: 3, COUNT: 4 } as const;
const LABELS = [
  messageKey('auth.accountStep'),
  messageKey('auth.organizationStep'),
  messageKey('auth.verifyStep'),
  messageKey('auth.welcomeStep'),
];
export function RegistrationWizard(): React.JSX.Element {
  const view = useRegistrationWizardState();
  return <RegistrationWizardView {...view} />;
}
type RegistrationWizardStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  step: number;
  submission: ReturnType<typeof useAuthSubmission>;
  account: AccountFields;
  setAccount: React.Dispatch<React.SetStateAction<AccountFields>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  organization: OrganizationFields;
  setOrganization: React.Dispatch<React.SetStateAction<OrganizationFields>>;
  register: () => Promise<void>;
  verify: (code: string) => Promise<void>;
  resend: () => Promise<void>;
};
function useRegistrationWizardState(): RegistrationWizardStateContract {
  const t = useTranslations();
  const locale = useLocale();
  const services = useServices();
  const auth = useAuth();
  const submission = useAuthSubmission();
  const [step, setStep] = useState<number>(STEP.ACCOUNT);
  const [account, setAccount] = useState<AccountFields>({
    ...EMPTY_ACCOUNT,
  });
  const [organization, setOrganization] = useState<OrganizationFields>({
    organizationName: '',
    locale: locale,
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const register = (): Promise<void> =>
    submission.run(async () => {
      await services.auth.register({
        ...account,
        organizationName: organization.organizationName,
        locale: organization.locale,
        acceptTerms: true,
        termsVersion: TERMS_VERSION,
      });
      setStep(STEP.VERIFY);
      setAccount((v) => ({ ...v, password: '' }));
    });
  const verify = (code: string): Promise<void> =>
    submission.run(async () => {
      auth.acceptSession(await services.auth.verify(account.email, code));
      setStep(STEP.WELCOME);
    });
  const resend = (): Promise<void> => submission.run(() => services.auth.resend(account.email));
  return {
    t,
    step,
    submission,
    account,
    setAccount,
    setStep,
    organization,
    setOrganization,
    register,
    verify,
    resend,
  };
}
function OrganizationStage(view: ReturnType<typeof useRegistrationWizardState>): React.JSX.Element {
  const { submission, setStep, organization, setOrganization, register } = view;
  return (
    <OrganizationStep
      value={organization}
      onChange={setOrganization}
      onBack={() => {
        setStep(STEP.ACCOUNT);
      }}
      onNext={() => {
        void register();
      }}
      busy={submission.busy}
    />
  );
}

function WizardStage(view: ReturnType<typeof useRegistrationWizardState>): React.JSX.Element {
  const { step, submission, account, setAccount, setStep, verify, resend } = view;
  return (
    <m.div
      key={step}
      initial={{ opacity: 0, x: MOTION.OFFSET }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -MOTION.OFFSET }}
      transition={{ duration: MOTION.DURATION.SHORT }}
    >
      {step === STEP.ACCOUNT ? (
        <AccountStep
          value={account}
          onChange={setAccount}
          onNext={() => {
            setStep(STEP.ORGANIZATION);
          }}
        />
      ) : null}
      {step === STEP.ORGANIZATION ? <OrganizationStage {...view} /> : null}
      {step === STEP.VERIFY ? (
        <VerifyStep
          busy={submission.busy || !!submission.remaining}
          onVerify={verify}
          onResend={resend}
        />
      ) : null}
      {step === STEP.WELCOME ? <WelcomeStep /> : null}
    </m.div>
  );
}

function WizardTransition(view: ReturnType<typeof useRegistrationWizardState>): React.JSX.Element {
  return (
    <AnimatePresence mode="wait">
      <WizardStage key={view.step} {...view} />
    </AnimatePresence>
  );
}

function WizardContent(view: ReturnType<typeof useRegistrationWizardState>): React.JSX.Element {
  const { t, step, submission } = view;
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{t('common.register')}</h1>
      <ol
        className="flex justify-between gap-2 text-xs"
        aria-label={t('auth.registrationProgress')}
      >
        {LABELS.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? 'step' : undefined}
            className={step === index ? 'font-semibold text-primary' : 'text-muted-foreground'}
          >
            {t(label)}
          </li>
        ))}
      </ol>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <m.div
          className="h-full origin-left bg-primary"
          initial={false}
          animate={{ scaleX: (step + 1) / STEP.COUNT }}
          transition={MOTION.SPRING}
        />
      </div>
      <AuthErrorNotice {...submission} />
      <WizardTransition {...view} />
    </section>
  );
}

function RegistrationWizardView(
  view: ReturnType<typeof useRegistrationWizardState>,
): React.JSX.Element {
  return <WizardContent {...view} />;
}

const EMPTY_ACCOUNT: AccountFields = { fullName: '', email: '', password: '', phone: '' };
