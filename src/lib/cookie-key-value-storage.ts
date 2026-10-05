import { PROPERTY_PREFERENCE } from '../config/property.constants';
import type { KeyValueStorage } from './ports';
import {
  COOKIE_PATTERN,
  LOCALE_COOKIE_MAX_AGE,
  STORAGE_KEYS,
  SUPPORTED_LOCALES,
} from '../config/app.constants';
export class CookieKeyValueStorage implements KeyValueStorage {
  public get(key: string): string | undefined {
    if (key === PROPERTY_PREFERENCE.KEY)
      return document.cookie.match(PROPERTY_PREFERENCE.COOKIE)?.[1];
    if (key !== STORAGE_KEYS.LOCALE) return undefined;
    return document.cookie.match(COOKIE_PATTERN)?.[1];
  }
  public set(key: string, value: string): void {
    if (key === PROPERTY_PREFERENCE.KEY) {
      if (value && !PROPERTY_PREFERENCE.PATTERN.test(value)) return;
      document.cookie =
        PROPERTY_PREFERENCE.KEY +
        '=' +
        encodeURIComponent(value) +
        ';Path=/;SameSite=Lax;Max-Age=' +
        String(LOCALE_COOKIE_MAX_AGE);
      return;
    }
    if (key !== STORAGE_KEYS.LOCALE || !SUPPORTED_LOCALES.some((locale) => locale === value))
      return;
    document.cookie = `${STORAGE_KEYS.LOCALE}=${encodeURIComponent(value)};Path=/;SameSite=Lax;Max-Age=${String(LOCALE_COOKIE_MAX_AGE)}`;
  }
}
