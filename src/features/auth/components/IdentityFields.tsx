'use client';
import { AuthField } from './AuthField';
import type { AccountFields } from '../schemas/account.schema';
import { PASSWORD_PATTERN } from '../../../config/auth.constants';
const INPUT_TYPES = {
  fullName: 'text',
  email: 'email',
  password: 'password',
  phone: 'tel',
  organizationName: 'text',
  currentPassword: 'password',
} as const;
const AUTOCOMPLETE = {
  fullName: 'name',
  email: 'email',
  password: 'new-password',
  phone: 'tel',
  organizationName: 'organization',
  currentPassword: 'current-password',
} as const;
export function IdentityFields<
  T extends Partial<AccountFields> & { organizationName?: string; currentPassword?: string },
>({ value, onChange }: { value: T; onChange: (value: T) => void }): React.JSX.Element {
  return (
    <>
      {(Object.keys(value) as (keyof T & keyof typeof INPUT_TYPES)[]).map((field) => (
        <AuthField
          key={field}
          field={field}
          type={INPUT_TYPES[field]}
          autoComplete={AUTOCOMPLETE[field]}
          required={field !== PHONE_FIELD}
          pattern={field === PASSWORD_FIELD ? PASSWORD_PATTERN.source : undefined}
          value={String(value[field])}
          onChange={(event) => {
            onChange({ ...value, [field]: event.target.value });
          }}
        />
      ))}
    </>
  );
}
const PHONE_FIELD = 'phone';
const PASSWORD_FIELD = 'password';
