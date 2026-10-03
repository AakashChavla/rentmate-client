import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ServicesProvider } from '../providers/ServicesProvider';
import { MotionProvider } from '../providers/MotionProvider';
import { DIRECTIONS, RTL_LOCALES } from '../config/app.constants';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={RTL_LOCALES.has(locale) ? DIRECTIONS.RTL : DIRECTIONS.LTR}>
      <body className={`${inter.variable} ${display.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ServicesProvider>
            <MotionProvider>{children}</MotionProvider>
          </ServicesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
