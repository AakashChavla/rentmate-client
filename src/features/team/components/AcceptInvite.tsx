'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { m, useReducedMotion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useServices } from '../../../providers/ServicesProvider';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { acceptSchema } from '../schemas/invite.schema';
import { ROUTES, STORAGE_KEYS } from '../../../config/app.constants';
import { IDENTITY_ROLE } from '../../../config/auth.constants';
import { inviteLoginRoute } from '../../../config/property.constants';
import { MOTION } from '../../../config/motion';
type useAcceptInviteStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  params: ReturnType<typeof useSearchParams>;
  services: ReturnType<typeof useServices>;
  router: ReturnType<typeof useRouter>;
  submission: ReturnType<typeof useAuthSubmission>;
  reduced: boolean | null;
  fullName: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  invalid: boolean;
  setInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  home: string | null;
  setHome: React.Dispatch<React.SetStateAction<string | null>>;
  token: string;
  validToken: boolean;
  submit: () => void;
};
function useAcceptInviteState(): useAcceptInviteStateContract {
  const t = useTranslations();
  const params = useSearchParams();
  const services = useServices();
  const router = useRouter();
  const submission = useAuthSubmission();
  const reduced = useReducedMotion();
  const [fullName, setName] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [home, setHome] = useState<string | null>(null);
  const token = params.get('token') ?? '';
  const validToken = acceptSchema.shape.token.safeParse(token).success;
  const submit = (): void => {
    const parsed = acceptSchema.safeParse({ token, fullName, password });
    setInvalid(!parsed.success);
    if (!parsed.success) return;
    void submission.run(async () => {
      const result = await services.invitations.accept(parsed.data);
      services.preferences.set(STORAGE_KEYS.LOCALE, result.locale);
      setPassword('');
      setHome(result.roleKey === IDENTITY_ROLE.TENANT ? ROUTES.TENANT_DASHBOARD : ROUTES.DASHBOARD);
    });
  };
  return {
    t,
    params,
    services,
    router,
    submission,
    reduced,
    fullName,
    setName,
    password,
    setPassword,
    invalid,
    setInvalid,
    home,
    setHome,
    token,
    validToken,
    submit,
  };
}
export function AcceptInvite(): React.JSX.Element {
  const view = useAcceptInviteState();
  return <AcceptInviteView {...view} />;
}
function AcceptInviteView(view: ReturnType<typeof useAcceptInviteState>): React.JSX.Element {
  const { t, submission, home, validToken, submit } = view;
  if (home) return <InviteSuccess {...view} />;
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h1 className="text-3xl font-bold">{t('team.acceptTitle')}</h1>
      <p className="text-muted-foreground">{t('team.acceptHint')}</p>
      {validToken ? (
        <AcceptInviteFields {...view} />
      ) : (
        <p role="alert" className="text-danger">
          {t('errors.INVITE_INVALID')}
        </p>
      )}
      <AuthErrorNotice {...submission} />
    </form>
  );
}

function InviteSuccess(view: Parameters<typeof AcceptInviteView>[0]): React.JSX.Element {
  const { t, router, reduced, home } = view;
  return (
    <div className="space-y-6 text-center">
      <m.div
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={MOTION.SPRING}
      >
        <CheckCircle2 aria-hidden className="mx-auto size-16 text-secondary" />
      </m.div>
      <h1 className="text-2xl font-bold">{t('team.acceptedTitle')}</h1>
      <p>{t('team.acceptedHint')}</p>
      <Button
        onClick={() => {
          router.replace(inviteLoginRoute(home ?? ROUTES.DASHBOARD));
          router.refresh();
        }}
      >
        {t('auth.signIn')}
      </Button>
    </div>
  );
}

function AcceptInviteFields(view: Parameters<typeof AcceptInviteView>[0]): React.JSX.Element {
  const { t, submission, fullName, setName, password, setPassword, invalid } = view;
  return (
    <>
      <InputField
        label={t('auth.fullName')}
        value={fullName}
        autoComplete="name"
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <InputField
        label={t('auth.password')}
        type="password"
        value={password}
        autoComplete="new-password"
        hint={t('team.passwordHint')}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      {invalid ? (
        <p role="alert" className="text-danger">
          {t('team.validation')}
        </p>
      ) : null}
      <Button className="w-full" disabled={submission.busy}>
        {t('team.acceptAction')}
      </Button>
    </>
  );
}
