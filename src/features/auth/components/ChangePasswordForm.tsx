'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useServices } from '../../../providers/ServicesProvider';
import { Button } from '../../../components/ui/Button';
import { PASSWORD_PATTERN } from '../../../config/auth.constants';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { IdentityFields } from './IdentityFields';
import { PasswordStrength } from './PasswordStrength';
import { AuthErrorNotice } from './AuthErrorNotice';
export function ChangePasswordForm(): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const submission = useAuthSubmission();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const change = (): Promise<void> =>
    submission.run(async () => {
      await services.auth.change(current, password);
      setCurrent('');
      setPassword('');
      toast.success(t('auth.passwordChanged'));
    });
  return (
    <form
      className="space-y-5 rounded-2xl border border-border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void change();
      }}
    >
      <h2 className="text-xl font-semibold">{t('auth.changePassword')}</h2>
      <IdentityFields
        value={{ currentPassword: current, password }}
        onChange={(fields) => {
          setCurrent(fields.currentPassword);
          setPassword(fields.password);
        }}
      />
      <PasswordStrength password={password} />
      <AuthErrorNotice {...submission} />
      <Button
        disabled={submission.busy || !!submission.remaining || !PASSWORD_PATTERN.test(password)}
      >
        {t('auth.changePassword')}
      </Button>
    </form>
  );
}
