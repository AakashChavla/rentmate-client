'use client';
import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { STATUS_KEYS, UNIT_STATUS } from '../../../config/unit.constants';
import type { Unit } from '../api/units-api';
export function StatusSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: Unit['status'];
  onChange: (status: Unit['status']) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const t = useTranslations();
  const id = useId();
  return (
    <label htmlFor={id}>
      {t('unit.status')}
      <select
        id={id}
        className="ms-2 rounded border border-border bg-background p-2"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value as Unit['status']);
        }}
      >
        {Object.values(UNIT_STATUS).map((s) => (
          <option key={s} value={s}>
            {t(STATUS_KEYS[s])}
          </option>
        ))}
      </select>
    </label>
  );
}
