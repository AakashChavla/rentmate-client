'use client';
import { useTranslations } from 'next-intl';
import { USER_STATUS_VALUES } from '../../../config/auth.constants';
import { identityLabel } from '../../../lib/identity-label';

export function StatusSelect({
  value,
  onChange,
  all = false,
}: {
  value: string;
  onChange: (value: string) => void;
  all?: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <label className="flex flex-col gap-2">
      <span>{t('auth.status')}</span>
      <select
        className="rounded-xl border border-border bg-background p-3"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {all ? <option value="">{t('auth.allStatuses')}</option> : null}
        {USER_STATUS_VALUES.map((status) => (
          <option key={status} value={status}>
            {identityLabel(t, status)}
          </option>
        ))}
      </select>
    </label>
  );
}
