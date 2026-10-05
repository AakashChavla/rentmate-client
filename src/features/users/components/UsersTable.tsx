'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { m } from 'motion/react';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { InputField } from '../../../components/ui/FormField';
import { PERMISSION, IDENTITY_ROLE } from '../../../config/auth.constants';
import { MOTION } from '../../../config/motion';
import { useAuth } from '../../../providers/AuthProvider';
import { PermissionGate } from '../../auth';
import { ApiError } from '../../../lib/api/api-error';
import { useUsers } from '../hooks/use-users';
import type { User } from '../api/users-api';
import { EditUserDialog } from './EditUserDialog';
import { ManageRolesDialog } from './ManageRolesDialog';
import { StatusSelect } from './StatusSelect';
import { identityLabel } from '../../../lib/identity-label';

export function UsersTable(): React.JSX.Element {
  const view = useUsersTableState();
  return <UsersTableView {...view} />;
}
type UsersTableStateContract = {
  t: ReturnType<typeof useTranslations<never>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  query: ReturnType<typeof useUsers>;
  users: User[];
  setEditing: React.Dispatch<React.SetStateAction<User | null>>;
  setRoles: React.Dispatch<React.SetStateAction<User | null>>;
  editing: User | null;
  roles: User | null;
};
function useUsersTableState(): UsersTableStateContract {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [roles, setRoles] = useState<User | null>(null);
  const query = useUsers(search, status);
  const users = query.data?.pages.flatMap((page) => page.data) ?? [];
  return {
    t,
    search,
    setSearch,
    status,
    setStatus,
    query,
    users,
    setEditing,
    setRoles,
    editing,
    roles,
  };
}
function MembersTable(view: ReturnType<typeof useUsersTableState>): React.JSX.Element {
  const { t, users, setEditing, setRoles } = view;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-start">
        <caption className="sr-only">{t('auth.users')}</caption>
        <thead className="bg-muted text-sm">
          <tr>
            <th className="p-4 text-start">{t('auth.fullName')}</th>
            <th className="p-4 text-start">{t('auth.status')}</th>
            <th className="p-4 text-start">{t('auth.roles')}</th>
            <th className="p-4 text-start">{t('auth.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              index={index}
              edit={() => {
                setEditing(user);
              }}
              roles={() => {
                setRoles(user);
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserFilters(view: ReturnType<typeof useUsersTableState>): React.JSX.Element {
  const { t, search, setSearch, status, setStatus } = view;
  return (
    <div className="flex flex-wrap items-end gap-4">
      <InputField
        label={t('auth.searchUsers')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        type="search"
      />
      <StatusSelect value={identityLabel(t, status)} onChange={setStatus} all />
    </div>
  );
}

function UsersContent(view: ReturnType<typeof useUsersTableState>): React.JSX.Element {
  const { t, query, users, setEditing, setRoles, editing, roles } = view;
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{t('auth.users')}</h1>
      <UserFilters {...view} />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : null}
      <UsersError query={query} />
      {!query.isLoading && !query.error && !users.length ? (
        <p className="rounded-xl bg-muted p-8 text-center">{t('auth.noUsers')}</p>
      ) : null}
      <MembersTable {...view} />
      {query.hasNextPage ? (
        <Button
          disabled={query.isFetchingNextPage}
          onClick={() => {
            void query.fetchNextPage();
          }}
        >
          {t('auth.loadMore')}
        </Button>
      ) : null}
      <EditUserDialog
        user={editing}
        onClose={() => {
          setEditing(null);
        }}
      />
      <ManageRolesDialog
        user={roles}
        onClose={() => {
          setRoles(null);
        }}
      />
    </section>
  );
}

function UsersTableView(view: ReturnType<typeof useUsersTableState>): React.JSX.Element {
  return <UsersContent {...view} />;
}

function UserRow({
  user,
  index,
  edit,
  roles,
}: {
  user: User;
  index: number;
  edit: () => void;
  roles: () => void;
}): React.JSX.Element {
  const view = useUserRowState({
    user,
    index,
    edit,
    roles,
  });
  return <UserRowView {...view} />;
}
type UserRowStateContract = {
  index: number;
  user: User;
  edit: () => void;
  t: ReturnType<typeof useTranslations<never>>;
  owner: boolean;
  roles: () => void;
};
function useUserRowState({
  user,
  index,
  edit,
  roles,
}: {
  user: User;
  index: number;
  edit: () => void;
  roles: () => void;
}): UserRowStateContract {
  const t = useTranslations();
  const auth = useAuth();
  const owner = auth.roles.some((role) => role.role === IDENTITY_ROLE.OWNER);
  return { index, user, edit, t, owner, roles };
}
function UserRowView(view: ReturnType<typeof useUserRowState>): React.JSX.Element {
  const { index, user, edit, t, owner, roles } = view;
  return (
    <m.tr
      initial={{ opacity: 0, y: MOTION.OFFSET }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.DURATION.SHORT, delay: index * MOTION.STAGGER }}
      className="border-t border-border"
    >
      <td className="p-4">
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </td>
      <td className="p-4 text-sm">{identityLabel(t, user.status)}</td>
      <td className="p-4">
        {user.roles?.map((role) => (
          <span key={role.id} className="me-2 inline-block rounded-full bg-muted px-3 py-1 text-xs">
            {identityLabel(t, role.role)}
          </span>
        ))}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <PermissionGate anyOf={[PERMISSION.USER_UPDATE]}>
            <Button variant="ghost" size="sm" onClick={edit}>
              {t('auth.edit')}
            </Button>
          </PermissionGate>
          {owner ? (
            <PermissionGate anyOf={[PERMISSION.ROLE_ASSIGN]}>
              <Button variant="outline" size="sm" onClick={roles}>
                {t('auth.manageRoles')}
              </Button>
            </PermissionGate>
          ) : null}
        </div>
      </td>
    </m.tr>
  );
}

function UsersError({ query }: { query: ReturnType<typeof useUsers> }): React.JSX.Element | null {
  const t = useTranslations();
  if (!query.error) return null;
  return (
    <div role="alert" className="rounded-xl border border-danger/20 p-5">
      <p>{t('auth.usersError')}</p>
      {query.error instanceof ApiError && query.error.requestId ? (
        <p>{t('auth.requestId', { id: query.error.requestId })}</p>
      ) : null}
      <Button
        variant="outline"
        onClick={() => {
          void query.refetch();
        }}
      >
        {t('auth.retry')}
      </Button>
    </div>
  );
}
