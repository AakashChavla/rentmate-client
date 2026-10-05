'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useServices } from '../../../providers/ServicesProvider';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/FormField';
import { USERS_QUERY, USER_STATUS } from '../../../config/auth.constants';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import type { User } from '../api/users-api';
import { StatusSelect } from './StatusSelect';

export function EditUserDialog({
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
          <EditUser key={user.id} user={user} onClose={onClose} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
function EditUser({ user, onClose }: { user: User; onClose: () => void }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission(true);
  const [fullName, setFullName] = useState(user.fullName);
  const [status, setStatus] = useState(user.status);
  const save = (): Promise<void> =>
    submission.run(async () => {
      await services.users.update(user.id, {
        fullName,
        ...(status === USER_STATUS.ACTIVE || status === USER_STATUS.SUSPENDED ? { status } : {}),
      });
      await client.invalidateQueries({ queryKey: USERS_QUERY });
      toast.success(t('auth.saved'));
      onClose();
    });
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <DialogTitle>{t('auth.edit')}</DialogTitle>
      <DialogDescription>{user.email}</DialogDescription>
      <InputField
        label={t('auth.fullName')}
        required
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
        }}
      />
      <StatusSelect
        value={status}
        onChange={(value) => {
          setStatus(value as User['status']);
        }}
      />
      <AuthErrorNotice {...submission} />
      <Button disabled={submission.busy}>{t('auth.save')}</Button>
    </form>
  );
}
