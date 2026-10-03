'use client';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { THEME } from '../../config/app.constants';
export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations();
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t('common.theme')}
      onClick={() => {
        setTheme(resolvedTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK);
      }}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
