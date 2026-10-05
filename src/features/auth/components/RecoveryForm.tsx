'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { getHomeRoute, sanitizeNext } from '../../../lib/auth-policy';
import { ROUTES } from '../../../config/app.constants';
import { PASSWORD_PATTERN } from '../../../config/auth.constants';
import { Button } from '../../../components/ui/Button';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { VerifyStep } from './VerifyStep';
import { AuthField } from './AuthField';
import { AuthErrorNotice } from './AuthErrorNotice';
import { PasswordStrength } from './PasswordStrength';
export function RecoveryForm({ reset = false }: { reset?: boolean }): React.JSX.Element {
  const view = useRecoveryFormState({ reset });
  return <RecoveryFormView {...view} />;
}
type RecoveryFormStateContract = {
  reset: boolean;
  t: ReturnType<typeof useTranslations<never>>;
  submission: ReturnType<typeof useAuthSubmission>;
  sent: boolean;
  send: () => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  invalid: boolean;
  verify: (code: string) => Promise<void>;
};
function useRecoveryFormState({ reset = false }: { reset?: boolean }): RecoveryFormStateContract {
  const t = useTranslations();
  const services = useServices();
  const auth = useAuth();
  const router = useRouter();
  const submission = useAuthSubmission();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const send = (): Promise<void> =>
    submission.run(async () => {
      if (reset) await services.auth.forgot(email);
      else await services.auth.sendOtp(email);
      setSent(true);
    });
  const verify = (code: string): Promise<void> =>
    submission.run(async () => {
      if (reset) {
        setInvalid(!PASSWORD_PATTERN.test(password));
        if (!PASSWORD_PATTERN.test(password)) return;
        await services.auth.reset(email, code, password);
        router.replace(ROUTES.LOGIN);
      } else {
        const me = await services.auth.verifyOtp(email, code);
        auth.acceptSession(me);
        router.replace(
          sanitizeNext(new URLSearchParams(window.location.search).get('next'), getHomeRoute(me)),
        );
        router.refresh();
      }
    });
  return {
    reset,
    t,
    submission,
    sent,
    send,
    email,
    setEmail,
    password,
    setPassword,
    invalid,
    verify,
  };
}
function RecoveryVerification(view: ReturnType<typeof useRecoveryFormState>): React.JSX.Element {
  const { reset, t, submission, send, email, password, setPassword, invalid, verify } = view;
  return (
    <>
      <p className="break-all text-sm text-muted-foreground">{email}</p>
      {reset ? (
        <>
          <AuthField
            field="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <PasswordStrength password={password} />
          {invalid ? <p role="alert">{t('auth.fieldInvalid')}</p> : null}
        </>
      ) : null}
      <VerifyStep
        onVerify={verify}
        onResend={send}
        busy={submission.busy || !!submission.remaining}
      />
    </>
  );
}

function RecoveryContent(view: ReturnType<typeof useRecoveryFormState>): React.JSX.Element {
  const { reset, t, submission, sent, send, email, setEmail } = view;
  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">
        {reset ? t('common.forgotPassword') : t('auth.useOtp')}
      </h1>
      <AuthErrorNotice {...submission} />
      {!sent ? (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <AuthField
            field="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Button className="w-full" disabled={submission.busy || !!submission.remaining}>
            {t('auth.sendCode')}
          </Button>
        </form>
      ) : (
        <RecoveryVerification {...view} />
      )}
      <Link href={ROUTES.LOGIN} className="block text-center text-primary">
        {t('auth.usePassword')}
      </Link>
    </section>
  );
}

function RecoveryFormView(view: ReturnType<typeof useRecoveryFormState>): React.JSX.Element {
  return <RecoveryContent {...view} />;
}
