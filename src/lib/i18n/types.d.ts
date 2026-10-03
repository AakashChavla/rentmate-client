import type { SupportedLocale } from '../../config/app.constants';
import type { I18nTranslations } from './generated/i18n.generated';
declare module 'next-intl' {
  interface AppConfig {
    Locale: SupportedLocale;
    Messages: I18nTranslations;
  }
}
