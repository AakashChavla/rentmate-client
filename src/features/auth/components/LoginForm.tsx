'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { getHomeRoute, sanitizeNext } from '../../../lib/auth-policy';
import { loginSchema } from '../schemas/account.schema';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { AuthErrorNotice } from './AuthErrorNotice';
import { IdentityFields } from './IdentityFields';
import { LoginLinks } from './LoginLinks';
export function LoginForm(): React.JSX.Element {
  const t = useTranslations();
  const auth = useAuth();
  const router = useRouter();
  const submission = useAuthSubmission();
  const [value, setValue] = useState({ email: '', password: '' });
  const [invalid, setInvalid] = useState(false);
  const submit = (): Promise<void> =>
    submission.run(async () => {
      const parsed = loginSchema.safeParse(value);
      setInvalid(!parsed.success);
      if (!parsed.success) return;
      const me = await auth.login(parsed.data);
      router.replace(
        sanitizeNext(new URLSearchParams(window.location.search).get('next'), getHomeRoute(me)),
      );
      router.refresh();
    });
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h1 className="text-3xl font-bold">{t('common.login')}</h1>
      <IdentityFields value={value} onChange={setValue} />
      {invalid ? <p role="alert">{t('auth.fieldInvalid')}</p> : null}
      <AuthErrorNotice {...submission} />
      <Button className="w-full" disabled={submission.busy || !!submission.remaining}>
        {t('auth.signIn')}
      </Button>
      <LoginLinks />
    </form>
  );
}
