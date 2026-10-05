'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/Button';
import { accountSchema, type AccountFields } from '../schemas/account.schema';
import { PasswordStrength } from './PasswordStrength';
import { IdentityFields } from './IdentityFields';
export function AccountStep({
  value,
  onNext,
  onChange,
}: {
  value: AccountFields;
  onNext: () => void;
  onChange: (value: AccountFields) => void;
}): React.JSX.Element {
  const t = useTranslations();
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const valid = accountSchema.safeParse(value);
        setInvalid(!valid.success);
        if (valid.success) {
          onChange(valid.data);
          onNext();
        }
      }}
    >
      <IdentityFields value={value} onChange={onChange} />
      <PasswordStrength password={value.password} />
      {invalid ? (
        <p role="alert" className="text-danger">
          {t('auth.fieldInvalid')}
        </p>
      ) : null}
      <Button className="w-full">{t('auth.next')}</Button>
    </form>
  );
}
