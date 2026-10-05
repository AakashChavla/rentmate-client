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
import { PERMISSION as P, USERS_ROUTE } from './auth.constants';
import { ROUTES } from './app.constants';
import { messageKey } from '../lib/i18n/message-key';
export const ADMIN_NAV = [
  { href: USERS_ROUTE, label: messageKey('auth.users'), icon: Users, permission: P.USER_READ },
  {
    href: ROUTES.DASHBOARD,
    label: messageKey('common.dashboard'),
    icon: Home,
    permission: P.AUTHENTICATED,
  },
  {
    href: ROUTES.PROPERTIES,
    label: messageKey('common.properties'),
    icon: Building2,
    permission: P.PROPERTY_READ,
  },
  {
    href: ROUTES.TENANTS,
    label: messageKey('common.tenants'),
    icon: Users,
    permission: P.TENANT_READ,
  },
  {
    href: ROUTES.INVOICES,
    label: messageKey('common.invoices'),
    icon: Receipt,
    permission: P.INVOICE_READ,
  },
  {
    href: ROUTES.PAYMENTS,
    label: messageKey('common.payments'),
    icon: Wallet,
    permission: P.PAYMENT_READ,
  },
  {
    href: ROUTES.COMPLAINTS,
    label: messageKey('common.complaints'),
    icon: MessageSquare,
    permission: P.COMPLAINT_READ,
  },
  {
    href: ROUTES.VISITORS,
    label: messageKey('common.visitors'),
    icon: DoorOpen,
    permission: P.VISITOR_READ,
  },
  {
    href: ROUTES.REPORTS,
    label: messageKey('common.reports'),
    icon: ChartNoAxesCombined,
    permission: P.REPORT_READ,
  },
  {
    href: ROUTES.SETTINGS,
    label: messageKey('common.settings'),
    icon: Settings,
    permission: P.ORGANIZATION_READ,
  },
] as const;
export const TENANT_NAV = [
  {
    href: ROUTES.TENANT_DASHBOARD,
    label: messageKey('common.dashboard'),
    icon: Home,
    permission: P.LEASE_READ,
  },
  {
    href: ROUTES.MY_LEASE,
    label: messageKey('common.myLease'),
    icon: FileText,
    permission: P.LEASE_READ,
  },
  {
    href: ROUTES.TENANT_PAYMENTS,
    label: messageKey('common.payments'),
    icon: Wallet,
    permission: P.PAYMENT_READ,
  },
  {
    href: ROUTES.TENANT_COMPLAINTS,
    label: messageKey('common.complaints'),
    icon: MessageSquare,
    permission: P.COMPLAINT_READ,
  },
  {
    href: ROUTES.TENANT_PROFILE,
    label: messageKey('common.profile'),
    icon: UserRound,
    permission: P.AUTHENTICATED,
  },
] as const;
