'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useServices } from '../../../providers/ServicesProvider';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { ScopeFields } from '../../team';
import { IDENTITY_ROLE, USERS_QUERY, ROLE_SCOPE } from '../../../config/auth.constants';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import type { User } from '../api/users-api';
import type { UseQueryResult } from '@tanstack/react-query';
import { identityLabel } from '../../../lib/identity-label';

export function ManageRolesDialog({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {user ? (
        <DialogContent>
          <RoleEditor key={user.id} user={user} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
function RoleEditor({ user }: { user: User }): React.JSX.Element {
  const view = useRoleEditorState({ user });
  return <RoleEditorView {...view} />;
}
type RoleEditorStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  user: User;
  current: UseQueryResult<User>;
  submission: ReturnType<typeof useAuthSubmission>;
  change: (action: () => Promise<void>) => Promise<void>;
  services: ReturnType<typeof useServices>;
  scope: string;
  scopeId: string;
  setScope: React.Dispatch<React.SetStateAction<string>>;
  setScopeId: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  catalog: UseQueryResult<string[]>;
};
function useRoleEditorState({ user }: { user: User }): RoleEditorStateContract {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission(true);
  const [role, setRole] = useState('');
  const [scope, setScope] = useState<string>(ROLE_SCOPE.ORGANIZATION);
  const [scopeId, setScopeId] = useState('');
  const catalog = useQuery({
    queryKey: ['roles'],
    queryFn: () => services.users.roles(),
    retry: false,
  });
  const current = useQuery({
    queryKey: [...USERS_QUERY, user.id],
    queryFn: () => services.users.get(user.id),
    retry: false,
  });
  const change = (action: () => Promise<void>): Promise<void> =>
    submission.run(async () => {
      await action();
      await client.invalidateQueries({ queryKey: USERS_QUERY });
      toast.success(t('auth.saved'));
    });
  return {
    t,
    user,
    current,
    submission,
    change,
    services,
    role,
    setRole,
    catalog,
    scope,
    scopeId,
    setScope,
    setScopeId,
  };
}
function AssignedRoles(view: ReturnType<typeof useRoleEditorState>): React.JSX.Element {
  const { t, user, current, submission, change, services } = view;
  return (
    <ul className="space-y-2">
      {(current.data ?? user).roles?.map((assignment) => (
        <li
          key={assignment.id}
          className="flex items-center justify-between rounded-xl bg-muted p-3"
        >
          <span className="text-sm">{identityLabel(t, assignment.role)}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={submission.busy}
            onClick={() => {
              void change(() => services.users.remove(user.id, assignment.id));
            }}
          >
            {t('auth.remove')}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function RoleSelector(view: ReturnType<typeof useRoleEditorState>): React.JSX.Element {
  const { t, role, setRole, catalog } = view;
  return (
    <label className="flex flex-col gap-2">
      <span>{t('auth.roles')}</span>
      <select
        className="rounded-xl border border-border bg-background p-3"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
        }}
      >
        <option value="">{t('auth.chooseRole')}</option>
        {catalog.data
          ?.filter(
            (value) =>
              value !== IDENTITY_ROLE.SUPER_ADMIN &&
              (view.scope === ROLE_SCOPE.ORGANIZATION || value !== IDENTITY_ROLE.OWNER),
          )
          .map((value) => (
            <option key={value} value={value}>
              {identityLabel(t, value)}
            </option>
          ))}
      </select>
    </label>
  );
}

function RoleDialogContent(view: ReturnType<typeof useRoleEditorState>): React.JSX.Element {
  const { t, user, current, submission, change, services, role, catalog } = view;
  return (
    <div className="space-y-5">
      <DialogTitle>{t('auth.manageRoles')}</DialogTitle>
      <DialogDescription>{user.email}</DialogDescription>
      <ScopeFields
        scope={view.scope}
        scopeId={view.scopeId}
        onChange={(scope, id) => {
          view.setScope(scope);
          view.setScopeId(id);
          view.setRole('');
        }}
      />
      <AssignedRoles {...view} />
      <RoleSelector {...view} />
      <Button
        disabled={!role || submission.busy || (view.scope === ROLE_SCOPE.PROPERTY && !view.scopeId)}
        onClick={() => {
          void change(() =>
            services.users.assign(user.id, role, view.scope, view.scopeId || undefined),
          );
        }}
      >
        {t('auth.assign')}
      </Button>

      <AuthErrorNotice {...submission} />
      {catalog.error || current.error ? <p role="alert">{t('auth.usersError')}</p> : null}
    </div>
  );
}

function RoleEditorView(view: ReturnType<typeof useRoleEditorState>): React.JSX.Element {
  return <RoleDialogContent {...view} />;
}
