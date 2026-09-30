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
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavLink[];
};

export const adminNav: NavGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Properties", icon: Building2, href: "/admin/properties" },
  { label: "Tenants", icon: Users, href: "/admin/tenants" },
  {
    label: "Billing",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/admin/billing/invoices", icon: FileText },
      { label: "Payments", href: "/admin/billing/payments", icon: Wallet },
    ],
  },
  { label: "Complaints", icon: MessageSquare, href: "/admin/complaints" },
  { label: "Visitors", icon: Contact, href: "/admin/visitors" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
  {
    label: "Settings",
    icon: Settings,
    children: [
      {
        label: "Organization",
        href: "/admin/settings/organization",
        icon: Building2,
      },
      { label: "Users", href: "/admin/settings/users", icon: UserCog },
      { label: "Roles", href: "/admin/settings/roles", icon: Shield },
    ],
  },
];

export const tenantNav: NavLink[] = [
  { label: "Home", href: "/tenant/dashboard", icon: LayoutDashboard },
  { label: "Lease", href: "/tenant/my-lease", icon: ScrollText },
  { label: "Payments", href: "/tenant/payments", icon: CreditCard },
  { label: "Complaints", href: "/tenant/complaints", icon: MessageSquare },
  { label: "Visitors", href: "/tenant/visitors", icon: Contact },
  { label: "Profile", href: "/tenant/profile", icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href;
}
