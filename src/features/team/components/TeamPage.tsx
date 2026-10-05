'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { can } from '../../../lib/auth-policy';
import { identityLabel } from '../../../lib/identity-label';
import { Button } from '../../../components/ui/Button';
import { DateText } from '../../../components/shared/DateText';
import { InviteDialog } from './InviteDialog';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import {
  INVITE_STATUS,
  INVITE_STATUS_KEYS,
  DOMAIN_QUERY,
  DOMAIN_PERMISSION,
} from '../../../config/property.constants';
import type { Invitation } from '../api/invitations-api';
export function TeamPage({ scopeId }: { scopeId?: string }): React.JSX.Element {
  const v = useTeam(scopeId);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{v.t('team.title')}</h1>
          <p className="mt-2 text-muted-foreground">{v.t('team.description')}</p>
        </div>
        {v.invite ? (
          <Button
            onClick={() => {
              v.setOpen(true);
            }}
          >
            {v.t('team.invite')}
          </Button>
        ) : null}
      </div>
      <InviteDialog
        open={v.open}
        onClose={() => {
          v.setOpen(false);
        }}
        scopeId={v.selected || undefined}
      />
      {v.query.isPending ? (
        <p role="status">{v.t('common.loading')}</p>
      ) : v.query.error ? (
        <p role="alert">{v.t('team.loadError')}</p>
      ) : (
        <InvitationsTable items={v.query.data.pages.flatMap((page) => page.data)} />
      )}{' '}
      {v.query.hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => {
            void v.query.fetchNextPage();
          }}
        >
          {v.t('property.more')}
        </Button>
      ) : null}
    </div>
  );
}
type useTeamContract = {
  selected: string;
  t: ReturnType<typeof useTranslations<never>>;
  invite: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  query: import('@tanstack/react-query').UseInfiniteQueryResult<
    import('@tanstack/react-query').InfiniteData<
      import('../../../lib/api/http-client').HttpResult<
        {
          id: string;
          email: string;
          roleKey:
            | 'SUPER_ADMIN'
            | 'ORG_OWNER'
            | 'PROPERTY_MANAGER'
            | 'ACCOUNTANT'
            | 'RECEPTIONIST'
            | 'MAINTENANCE_STAFF'
            | 'SECURITY_STAFF'
            | 'TENANT';
          scopeType: 'ORGANIZATION' | 'PROPERTY';
          scopeId: string;
          status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
          expiresAt: string;
          locale: 'en' | 'hi';
          createdAt: string;
        }[]
      >,
      unknown
    >,
    Error
  >;
};
function useTeam(scopeId?: string): useTeamContract {
  const t = useTranslations();
  const services = useServices();
  const auth = useAuth();
  const selection = usePropertySelection();
  const selected = scopeId ?? selection.propertyId;
  const invite =
    can(auth.me, DOMAIN_PERMISSION.INVITE, { propertyId: selected }) ||
    auth.roles.some((r) => can(auth.me, DOMAIN_PERMISSION.INVITE, { propertyId: r.scopeId }));
  const [open, setOpen] = useState(false);
  const query = useInfiniteQuery({
    queryKey: [...DOMAIN_QUERY.INVITES, selected],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      services.invitations.list({ scopeId: selected || undefined, cursor: pageParam }),
    getNextPageParam: (last) => last.meta?.page?.nextCursor ?? undefined,
    enabled: invite,
    retry: false,
  });
  return { t, invite, open, setOpen, query, selected };
}
function InvitationsTable({ items }: { items: Invitation[] }): React.JSX.Element {
  const t = useTranslations();
  if (!items.length)
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <h2 className="font-semibold">{t('team.empty')}</h2>
        <p className="mt-2 text-muted-foreground">{t('team.emptyHint')}</p>
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-start text-sm">
        <caption className="sr-only">{t('team.invitations')}</caption>
        <thead className="bg-muted">
          <tr>
            <th className="p-4 text-start">{t('auth.email')}</th>
            <th className="p-4 text-start">{t('auth.roles')}</th>
            <th className="p-4 text-start">{t('auth.status')}</th>
            <th className="p-4 text-start">{t('team.expires')}</th>
            <th className="p-4 text-start">{t('auth.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <InviteRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
type useInviteRowStateContract = {
  item: {
    id: string;
    email: string;
    roleKey:
      | 'SUPER_ADMIN'
      | 'ORG_OWNER'
      | 'PROPERTY_MANAGER'
      | 'ACCOUNTANT'
      | 'RECEPTIONIST'
      | 'MAINTENANCE_STAFF'
      | 'SECURITY_STAFF'
      | 'TENANT';
    scopeType: 'ORGANIZATION' | 'PROPERTY';
    scopeId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
    expiresAt: string;
    locale: 'en' | 'hi';
    createdAt: string;
  };
  t: ReturnType<typeof useTranslations<never>>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  auth: ReturnType<typeof useAuth>;
  submission: ReturnType<typeof useAuthSubmission>;
  allowed: boolean;
  pending: boolean;
  change: (action: () => Promise<unknown>) => void;
};
function useInviteRowState({ item }: { item: Invitation }): useInviteRowStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const auth = useAuth();
  const submission = useAuthSubmission();
  const allowed =
    can(auth.me, DOMAIN_PERMISSION.INVITE, { propertyId: item.scopeId }) &&
    (item.roleKey !== OWNER_ROLE ||
      auth.roles.some((r) => r.role === OWNER_ROLE && can(auth.me, DOMAIN_PERMISSION.INVITE)));
  const pending = item.status === INVITE_STATUS.PENDING || item.status === INVITE_STATUS.EXPIRED;
  const change = (action: () => Promise<unknown>): void => {
    void submission.run(async () => {
      await action();
      await client.invalidateQueries({ queryKey: DOMAIN_QUERY.INVITES });
    });
  };
  return { item, t, services, client, auth, submission, allowed, pending, change };
}
function InviteRow({ item }: { item: Invitation }): React.JSX.Element {
  const view = useInviteRowState({ item });
  return <InviteRowView {...view} />;
}
function InviteRowView(view: ReturnType<typeof useInviteRowState>): React.JSX.Element {
  const { item, t, services, submission, allowed, pending, change } = view;
  return (
    <tr className="border-t border-border">
      <td className="p-4">{item.email}</td>
      <td className="p-4">{identityLabel(t, item.roleKey)}</td>
      <td className="p-4">
        <span className="rounded-full bg-muted px-3 py-1 text-xs">
          {t(INVITE_STATUS_KEYS[item.status])}
        </span>
      </td>
      <td className="p-4">
        <DateText value={item.expiresAt} />
      </td>
      <td className="p-4">
        {pending && allowed ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={submission.busy}
              onClick={() => {
                change(() => services.invitations.resend(item.id));
              }}
            >
              {t('team.resend')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={submission.busy}
              onClick={() => {
                change(() => services.invitations.revoke(item.id));
              }}
            >
              {t('team.revoke')}
            </Button>
          </div>
        ) : null}
        <AuthErrorNotice {...submission} />
      </td>
    </tr>
  );
}
const OWNER_ROLE = 'ORG_OWNER';
