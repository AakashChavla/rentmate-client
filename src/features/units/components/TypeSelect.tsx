'use client';
import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { UNIT_TYPE, TYPE_KEYS } from '../../../config/unit.constants';
import type { Unit } from '../api/units-api';
export function TypeSelect({
  value,
  onChange,
}: {
  value: Unit['type'];
  onChange: (value: Unit['type']) => void;
}): React.JSX.Element {
  const id = useId();
  const t = useTranslations();
  return (
    <label htmlFor={id}>
      {t('unit.type')}
      <select
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value as Unit['type']);
        }}
      >
        {Object.values(UNIT_TYPE).map((type) => (
          <option key={type} value={type}>
            {t(TYPE_KEYS[type])}
          </option>
        ))}
      </select>
    </label>
  );
}
