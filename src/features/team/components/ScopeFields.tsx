'use client';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/Button';
import { useAccessibleProperties } from '../../../providers/use-accessible-properties';
import { ROLE_SCOPE } from '../../../config/auth.constants';
type useScopeFieldsStateContract = {
  scope: string;
  scopeId: string;
  onChange: (scope: string, id: string) => void;
  organizationAllowed: boolean;
  locked: boolean;
  t: ReturnType<typeof useTranslations<never>>;
  query: import('@tanstack/react-query').UseInfiniteQueryResult<
    import('@tanstack/react-query').InfiniteData<
      import('../../../lib/api/http-client').HttpResult<
        import('../../../lib/api/schema').components['schemas']['PropertyDto'][]
      >,
      unknown
    >,
    Error
  >;
  properties: import('../../../lib/api/schema').components['schemas']['PropertyDto'][];
};
function useScopeFieldsState({
  scope,
  scopeId,
  onChange,
  organizationAllowed = true,
  locked = false,
}: {
  scope: string;
  scopeId: string;
  onChange: (scope: string, id: string) => void;
  organizationAllowed?: boolean;
  locked?: boolean;
}): useScopeFieldsStateContract {
  const t = useTranslations();
  const query = useAccessibleProperties();
  const properties = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { scope, scopeId, onChange, organizationAllowed, locked, t, query, properties };
}
export function ScopeFields({
  scope,
  scopeId,
  onChange,
  organizationAllowed = true,
  locked = false,
}: {
  scope: string;
  scopeId: string;
  onChange: (scope: string, id: string) => void;
  organizationAllowed?: boolean;
  locked?: boolean;
}): React.JSX.Element {
  const view = useScopeFieldsState({
    scope,
    scopeId,
    onChange,
    organizationAllowed,
    locked,
  });
  return <ScopeFieldsView {...view} />;
}
function ScopeFieldsView(view: ReturnType<typeof useScopeFieldsState>): React.JSX.Element {
  const { scope, scopeId, onChange, locked, t, query, properties } = view;
  return (
    <div className="space-y-3">
      <ScopeSelect {...view} />
      {scope === ROLE_SCOPE.PROPERTY ? (
        <label className="flex flex-col gap-2">
          <span>{t('property.switcher')}</span>
          <select
            className="rounded-xl border border-border bg-background p-3"
            value={scopeId}
            disabled={locked || query.isPending}
            onChange={(e) => {
              onChange(scope, e.target.value);
            }}
          >
            <option value="">{t('team.chooseProperty')}</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {query.hasNextPage ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void query.fetchNextPage();
          }}
        >
          {t('property.more')}
        </Button>
      ) : null}
      {query.error ? <p role="alert">{t('property.loadError')}</p> : null}
    </div>
  );
}

function ScopeSelect(view: Parameters<typeof ScopeFieldsView>[0]): React.JSX.Element {
  const { scope, onChange, organizationAllowed, locked, t } = view;
  return (
    <label className="flex flex-col gap-2">
      <span>{t('team.scope')}</span>
      <select
        className="rounded-xl border border-border bg-background p-3"
        value={scope}
        disabled={locked}
        onChange={(e) => {
          onChange(e.target.value, '');
        }}
      >
        {organizationAllowed ? (
          <option value={ROLE_SCOPE.ORGANIZATION}>{t('auth.organizationScope')}</option>
        ) : null}
        <option value={ROLE_SCOPE.PROPERTY}>{t('team.propertyScope')}</option>
      </select>
    </label>
  );
}
