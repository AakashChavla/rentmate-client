'use client';
import { Toaster as Primitive } from 'sonner';
import { useTheme } from 'next-themes';
import { THEME } from '../../config/app.constants';
export function Toaster(): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  return <Primitive theme={resolvedTheme === THEME.DARK ? THEME.DARK : THEME.LIGHT} richColors />;
}
