import {
  Home,
  Building2,
  Users,
  Receipt,
  Wallet,
  MessageSquare,
  DoorOpen,
  ChartNoAxesCombined,
  Settings,
  FileText,
  UserRound,
} from 'lucide-react';
import { ROUTES } from './app.constants';
import { messageKey } from '../lib/i18n/message-key';
export const ADMIN_NAV = [
  {
    href: ROUTES.DASHBOARD,
    label: messageKey('common.dashboard'),
    icon: Home,
    permission: 'dashboard:read',
  },
  {
    href: ROUTES.PROPERTIES,
    label: messageKey('common.properties'),
    icon: Building2,
    permission: 'properties:read',
  },
  {
    href: ROUTES.TENANTS,
    label: messageKey('common.tenants'),
    icon: Users,
    permission: 'tenants:read',
  },
  {
    href: ROUTES.INVOICES,
    label: messageKey('common.invoices'),
    icon: Receipt,
    permission: 'invoices:read',
  },
  {
    href: ROUTES.PAYMENTS,
    label: messageKey('common.payments'),
    icon: Wallet,
    permission: 'payments:read',
  },
  {
    href: ROUTES.COMPLAINTS,
    label: messageKey('common.complaints'),
    icon: MessageSquare,
    permission: 'complaints:read',
  },
  {
    href: ROUTES.VISITORS,
    label: messageKey('common.visitors'),
    icon: DoorOpen,
    permission: 'visitors:read',
  },
  {
    href: ROUTES.REPORTS,
    label: messageKey('common.reports'),
    icon: ChartNoAxesCombined,
    permission: 'reports:read',
  },
  {
    href: ROUTES.SETTINGS,
    label: messageKey('common.settings'),
    icon: Settings,
    permission: 'settings:read',
  },
] as const;
export const TENANT_NAV = [
  {
    href: ROUTES.TENANT_DASHBOARD,
    label: messageKey('common.dashboard'),
    icon: Home,
    permission: 'tenant-dashboard:read',
  },
  {
    href: ROUTES.MY_LEASE,
    label: messageKey('common.myLease'),
    icon: FileText,
    permission: 'my-lease:read',
  },
  {
    href: ROUTES.TENANT_PAYMENTS,
    label: messageKey('common.payments'),
    icon: Wallet,
    permission: 'my-payments:read',
  },
  {
    href: ROUTES.TENANT_COMPLAINTS,
    label: messageKey('common.complaints'),
    icon: MessageSquare,
    permission: 'my-complaints:read',
  },
  {
    href: ROUTES.TENANT_PROFILE,
    label: messageKey('common.profile'),
    icon: UserRound,
    permission: 'my-profile:read',
  },
] as const;
