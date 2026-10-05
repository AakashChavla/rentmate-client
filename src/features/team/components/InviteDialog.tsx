'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { can } from '../../../lib/auth-policy';
import { identityLabel } from '../../../lib/identity-label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { ScopeFields } from './ScopeFields';
import { inviteSchema } from '../schemas/invite.schema';
import { INVITE_ROLES, DOMAIN_PERMISSION, DOMAIN_QUERY } from '../../../config/property.constants';
import { ROLE_SCOPE, IDENTITY_ROLE } from '../../../config/auth.constants';
import type { InviteInput } from '../api/invitations-api';
export function InviteDialog({
  open,
  onClose,
  scopeId,
}: {
  open: boolean;
  onClose: () => void;
  scopeId?: string | undefined;
}): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      {open ? (
        <DialogContent>
          <InviteForm onClose={onClose} scopeId={scopeId} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
type useInviteFormContract = {
  t: ReturnType<typeof useTranslations<never>>;
  auth: ReturnType<typeof useAuth>;
  services: ReturnType<typeof useServices>;
  client: ReturnType<typeof useQueryClient>;
  submission: ReturnType<typeof useAuthSubmission>;
  organizationAllowed: boolean;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  scope: string;
  setScope: React.Dispatch<React.SetStateAction<string>>;
  property: string;
  setProperty: React.Dispatch<React.SetStateAction<string>>;
  invalid: boolean;
  setInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  roles: (
    | 'ORG_OWNER'
    | 'PROPERTY_MANAGER'
    | 'ACCOUNTANT'
    | 'RECEPTIONIST'
    | 'MAINTENANCE_STAFF'
    | 'SECURITY_STAFF'
    | 'TENANT'
  )[];
};
function useInviteForm(scopeId?: string): useInviteFormContract {
  const t = useTranslations();
  const auth = useAuth();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const organizationAllowed = can(auth.me, DOMAIN_PERMISSION.INVITE);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('');
  const [scope, setScope] = useState<string>(
    scopeId || !organizationAllowed ? ROLE_SCOPE.PROPERTY : ROLE_SCOPE.ORGANIZATION,
  );
  const [property, setProperty] = useState(scopeId ?? '');
  const [invalid, setInvalid] = useState(false);
  const owner = auth.roles.some(
    (r) =>
      r.role === IDENTITY_ROLE.OWNER &&
      r.scope === ROLE_SCOPE.ORGANIZATION &&
      (!r.expiresAt || new Date(r.expiresAt) > new Date()),
  );
  const roles = INVITE_ROLES.filter(
    (r) => r !== IDENTITY_ROLE.OWNER || (owner && scope === ROLE_SCOPE.ORGANIZATION),
  );
  return {
    t,
    auth,
    services,
    client,
    submission,
    organizationAllowed,
    email,
    setEmail,
    role,
    setRole,
    scope,
    setScope,
    property,
    setProperty,
    invalid,
    setInvalid,
    roles,
  };
}
type useInviteFormStateContract = {
  onClose: () => void;
  scopeId: string | undefined;
  v: ReturnType<typeof useInviteForm>;
  submit: () => void;
};
function useInviteFormState({
  onClose,
  scopeId,
}: {
  onClose: () => void;
  scopeId?: string | undefined;
}): useInviteFormStateContract {
  const v = useInviteForm(scopeId);
  const submit = (): void => {
    const parsed = inviteSchema.safeParse({
      email: v.email,
      roleKey: v.role,
      scopeType: v.scope,
      scopeId: v.scope === ROLE_SCOPE.PROPERTY ? v.property : undefined,
    });
    v.setInvalid(!parsed.success);
    if (!parsed.success || !can(v.auth.me, DOMAIN_PERMISSION.INVITE, { propertyId: v.property }))
      return;
    void v.submission.run(async () => {
      await v.services.invitations.create(parsed.data as InviteInput);
      await v.client.invalidateQueries({ queryKey: DOMAIN_QUERY.INVITES });
      onClose();
    });
  };
  return { onClose, scopeId, v, submit };
}
function InviteForm({
  onClose,
  scopeId,
}: {
  onClose: () => void;
  scopeId?: string | undefined;
}): React.JSX.Element {
  const view = useInviteFormState({
    onClose,
    scopeId,
  });
  return <InviteFormView {...view} />;
}
function InviteFormView(view: ReturnType<typeof useInviteFormState>): React.JSX.Element {
  const { scopeId, v, submit } = view;
  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <DialogTitle>{v.t('team.invite')}</DialogTitle>
      <DialogDescription>{v.t('team.inviteHint')}</DialogDescription>
      <InputField
        label={v.t('auth.email')}
        type="email"
        value={v.email}
        onChange={(e) => {
          v.setEmail(e.target.value);
        }}
      />
      <InviteRoleSelect {...view} />
      <ScopeFields
        scope={v.scope}
        scopeId={v.property}
        organizationAllowed={v.organizationAllowed}
        locked={!!scopeId}
        onChange={(scope, id) => {
          v.setScope(scope);
          v.setProperty(id);
          v.setRole('');
        }}
      />
      {v.invalid ? (
        <p role="alert" className="text-sm text-danger">
          {v.t('team.validation')}
        </p>
      ) : null}
      <AuthErrorNotice {...v.submission} />
      <Button disabled={v.submission.busy}>{v.t('team.send')}</Button>
    </form>
  );
}

function InviteRoleSelect(view: Parameters<typeof InviteFormView>[0]): React.JSX.Element {
  const { v } = view;
  return (
    <label className="flex flex-col gap-2">
      <span>{v.t('auth.roles')}</span>
      <select
        className="rounded-xl border border-border bg-background p-3"
        value={v.role}
        onChange={(e) => {
          v.setRole(e.target.value);
        }}
      >
        <option value="">{v.t('auth.chooseRole')}</option>
        {v.roles.map((role) => (
          <option key={role} value={role}>
            {identityLabel(v.t, role)}
          </option>
        ))}
      </select>
    </label>
  );
}
