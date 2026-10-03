'use client';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { THEME, STORAGE_KEYS } from '../config/app.constants';
export function ThemeProvider({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce?: string;
}): React.JSX.Element {
  return (
    <NextThemeProvider
      attribute={THEME.ATTRIBUTE}
      defaultTheme={THEME.SYSTEM}
      storageKey={STORAGE_KEYS.THEME}
      {...(nonce ? { nonce } : {})}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
