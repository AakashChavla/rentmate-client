'use client';
import { useTranslations } from 'next-intl';
import type { OrganizationFields } from '../schemas/organization.schema';
export function ConsentFields({
  value,
  onChange,
}: {
  value: OrganizationFields;
  onChange: (v: OrganizationFields) => void;
}): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          required
          checked={value.acceptTerms}
          onChange={(e) => {
            onChange({ ...value, acceptTerms: e.target.checked });
          }}
        />
        <span>{t('auth.acceptTerms')}</span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          required
          checked={value.acceptPrivacy}
          onChange={(e) => {
            onChange({ ...value, acceptPrivacy: e.target.checked });
          }}
        />
        <span>{t('auth.acceptPrivacy')}</span>
      </label>
    </>
  );
}
