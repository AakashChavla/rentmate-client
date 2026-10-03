import { DEFAULT_LOCALE, LOCALE_PATTERN, type SupportedLocale } from '../../config/app.constants';
export interface LocaleSources {
  user?: string | undefined;
  cookie?: string | undefined;
  acceptLanguage?: string | undefined;
  organization?: string | undefined;
}
function supported(value: string | undefined): SupportedLocale | undefined {
  return value?.match(LOCALE_PATTERN)?.[1]?.toLowerCase() as SupportedLocale | undefined;
}
export function resolveLocale(sources: LocaleSources): SupportedLocale {
  return (
    supported(sources.user) ??
    supported(sources.cookie) ??
    supported(sources.acceptLanguage) ??
    supported(sources.organization) ??
    DEFAULT_LOCALE
  );
}
