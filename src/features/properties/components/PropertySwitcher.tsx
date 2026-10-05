'use client';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { useAccessibleProperties } from '../../../providers/use-accessible-properties';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { Button } from '../../../components/ui/Button';
import { DOMAIN_PERMISSION } from '../../../config/property.constants';
import { useOptionalAuth } from '../../../providers/AuthProvider';
export function PropertySwitcher(): React.JSX.Element | null {
  const t = useTranslations();
  const auth = useOptionalAuth();
  const query = useAccessibleProperties();
  const selection = usePropertySelection();
  const properties = query.data?.pages.flatMap((page) => page.data) ?? [];
  if (!auth?.permissions.includes(DOMAIN_PERMISSION.READ)) return null;
  return (
    <div className="flex items-center gap-2">
      <Building2 aria-hidden className="size-4 text-primary" />
      <label className="sr-only" htmlFor="property-switcher">
        {t('property.switcher')}
      </label>
      <select
        id="property-switcher"
        className="max-w-48 rounded-xl border border-border bg-card p-2 text-sm"
        value={selection.propertyId}
        onChange={(e) => {
          selection.select(e.target.value);
        }}
        disabled={query.isPending}
      >
        <option value="">{t('common.allProperties')}</option>
        {properties.map((p) => (
          <option value={p.id} key={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {query.hasNextPage ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void query.fetchNextPage();
          }}
        >
          {t('property.more')}
        </Button>
      ) : null}
      {query.error ? (
        <span role="alert" className="text-xs text-danger">
          {t('property.loadError')}
        </span>
      ) : null}
    </div>
  );
}
