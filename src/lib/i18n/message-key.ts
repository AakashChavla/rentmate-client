import type { I18nKey } from './generated/i18n.generated';
export function messageKey<T extends I18nKey>(key: T): T {
  return key;
}
