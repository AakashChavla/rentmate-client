import {
  BarChart3,
  Building2,
  Contact,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  User,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  href?: string;
  permission?: string;
  children?: NavLink[];
};

export const adminNav: NavGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Properties", icon: Building2, href: "/admin/properties", permission: "property:read" },
  { label: "Tenants", icon: Users, href: "/admin/tenants", permission: "tenant:read" },
  {
    label: "Billing",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/admin/billing/invoices", icon: FileText, permission: "invoice:read" },
      { label: "Payments", href: "/admin/billing/payments", icon: Wallet, permission: "payment:read" },
    ],
  },
  { label: "Complaints", icon: MessageSquare, href: "/admin/complaints", permission: "complaint:read" },
  { label: "Visitors", icon: Contact, href: "/admin/visitors", permission: "visitor:read" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports", permission: "report:read" },
  {
    label: "Settings",
    icon: Settings,
    children: [
      {
        label: "Organization",
        href: "/admin/settings/organization",
        icon: Building2,
        permission: "organization:read",
      },
      { label: "Users", href: "/admin/settings/users", icon: UserCog, permission: "user:read" },
      { label: "Roles", href: "/admin/settings/roles", icon: Shield, permission: "role:read" },
    ],
  },
];

export const tenantNav: NavLink[] = [
  { label: "Home", href: "/tenant/dashboard", icon: LayoutDashboard },
  { label: "Lease", href: "/tenant/my-lease", icon: ScrollText, permission: "lease:read" },
  { label: "Payments", href: "/tenant/payments", icon: CreditCard, permission: "invoice:read" },
  { label: "Complaints", href: "/tenant/complaints", icon: MessageSquare, permission: "complaint:read" },
  { label: "Visitors", href: "/tenant/visitors", icon: Contact, permission: "visitor:read" },
  { label: "Profile", href: "/tenant/profile", icon: User },
];

function allowed(permission: string | undefined, permissions: string[]): boolean {
  return !permission || permissions.includes(permission);
}

export function visibleAdminNav(permissions: string[]): NavGroup[] {
  return adminNav.flatMap((group) => {
    if (group.href) {
      return allowed(group.permission, permissions) ? [group] : [];
    }
    const children = (group.children ?? []).filter((child) => allowed(child.permission, permissions));
    if (children.length === 0) return [];
    return [{ ...group, children }];
  });
}

export function visibleTenantNav(permissions: string[]): NavLink[] {
  return tenantNav.filter((item) => allowed(item.permission, permissions));
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href;
}
