import { messageKey } from '../lib/i18n/message-key';
export const STATUS_LABELS = {
  active: { label: messageKey('common.statusActive'), className: 'bg-success/10 text-success' },
  pending: { label: messageKey('common.statusPending'), className: 'bg-warning/10 text-warning' },
  inactive: {
    label: messageKey('common.statusInactive'),
    className: 'bg-muted text-muted-foreground',
  },
} as const;
