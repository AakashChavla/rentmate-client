'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '../../../providers/AuthProvider';
import { useServices } from '../../../providers/ServicesProvider';
import { Button } from '../../../components/ui/Button';
import { STORAGE_KEYS, type SupportedLocale } from '../../../config/app.constants';
import { useAuthSubmission } from '../hooks/use-auth-submission';
import { AuthErrorNotice } from './AuthErrorNotice';
import { IdentityFields } from './IdentityFields';
import { LocaleSelect } from './LocaleSelect';
import { ChangePasswordForm } from './ChangePasswordForm';
export function ProfileForm(): React.JSX.Element {
  const auth = useAuth();
  return auth.user ? (
    <ProfileEditor
      key={auth.user.id}
      fullName={auth.user.fullName}
      phone={auth.user.phone ?? ''}
      locale={auth.user.locale}
    />
  ) : (
    <></>
  );
}
function ProfileEditor(props: {
  fullName: string;
  phone: string;
  locale: SupportedLocale;
}): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const auth = useAuth();
  const router = useRouter();
  const [value, setValue] = useState(props);
  const submission = useAuthSubmission();
  const save = (): Promise<void> =>
    submission.run(async () => {
      await services.users.profile(value);
      services.preferences.set(STORAGE_KEYS.LOCALE, value.locale);
      await auth.refetch();
      router.refresh();
      toast.success(t('auth.saved'));
    });
  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">{t('common.profile')}</h1>
      <form
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <IdentityFields
          value={{ fullName: value.fullName, phone: value.phone }}
          onChange={(fields) => {
            setValue({ ...value, ...fields });
          }}
        />
        <LocaleSelect
          value={value.locale}
          onChange={(locale) => {
            setValue({ ...value, locale });
          }}
        />
        <AuthErrorNotice {...submission} />
        <Button disabled={submission.busy}>{t('auth.save')}</Button>
      </form>
      <ChangePasswordForm />
    </section>
  );
}
