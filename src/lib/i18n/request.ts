import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { HTTP_HEADERS, STORAGE_KEYS } from '../../config/app.constants';
import { CATALOGS } from './generated/i18n.generated';
import { resolveLocale } from './locale';
export default getRequestConfig(() => {
  const locale = resolveLocale({
    cookie: cookies().get(STORAGE_KEYS.LOCALE)?.value,
    acceptLanguage: headers().get(HTTP_HEADERS.ACCEPT_LANGUAGE) ?? undefined,
  });
  return { locale, messages: CATALOGS[locale] };
});
