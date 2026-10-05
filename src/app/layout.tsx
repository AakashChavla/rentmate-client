import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import type { ReactNode, CSSProperties } from 'react';
import { ServicesProvider } from '../providers/ServicesProvider';
import { MotionProvider } from '../providers/MotionProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { Toaster } from '../components/ui/Sonner';
import { DIRECTIONS, RTL_LOCALES, HTTP_HEADERS } from '../config/app.constants';
import { MOTION } from '../config/motion';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
export async function generateMetadata(): Promise<{ title: string; description: string }> {
  const t = await getTranslations();
  return { title: t('common.brand'), description: t('common.footerDescription') };
}
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const locale = await getLocale();
  const messages = await getMessages();
  const nonce = (await headers()).get(HTTP_HEADERS.NONCE) ?? undefined;
  const styles = {
    '--motion-short': `${String(MOTION.DURATION.SHORT)}s`,
    '--motion-shimmer': `${String(MOTION.DURATION.SHIMMER)}s`,
  } as CSSProperties;
  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? DIRECTIONS.RTL : DIRECTIONS.LTR}
      suppressHydrationWarning
    >
      <body className={`${inter.variable} ${display.variable}`} style={styles}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider {...(nonce ? { nonce } : {})}>
            <ServicesProvider>
              <QueryProvider>
                <MotionProvider>
                  {children}
                  <Toaster />
                </MotionProvider>
              </QueryProvider>
            </ServicesProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
