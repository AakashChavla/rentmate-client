import { DOMAIN_PERMISSION } from './property.constants';
import { PERMISSION as P } from './auth.constants';
export const ROUTE_PERMISSIONS = [
  ['/settings/team', DOMAIN_PERMISSION.INVITE],
  ['/settings/users', P.USER_READ],
  ['/settings/roles', P.ROLE_READ],
  ['/settings', P.ORGANIZATION_READ],
  ['/dashboard', P.AUTHENTICATED],
  ['/properties', P.PROPERTY_READ],
  ['/tenants', P.TENANT_READ],
  ['/billing/invoices', P.INVOICE_READ],
  ['/billing/payments', P.PAYMENT_READ],
  ['/complaints', P.COMPLAINT_READ],
  ['/visitors', P.VISITOR_READ],
  ['/reports', P.REPORT_READ],
  ['/profile', P.AUTHENTICATED],
  ['/tenant/profile', P.AUTHENTICATED],
  ['/tenant/dashboard', P.LEASE_READ],
  ['/tenant/my-lease', P.LEASE_READ],
  ['/tenant/payments', P.PAYMENT_READ],
  ['/tenant/complaints', P.COMPLAINT_READ],
  ['/tenant/visitors', P.VISITOR_READ],
] as const;
