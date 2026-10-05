import { messageKey } from '../lib/i18n/message-key';
export const IDENTITY_LABELS = {
  SUPER_ADMIN: messageKey('auth.roleSuperAdmin'),
  ORG_OWNER: messageKey('auth.roleOwner'),
  PROPERTY_MANAGER: messageKey('auth.roleManager'),
  ACCOUNTANT: messageKey('auth.roleAccountant'),
  RECEPTIONIST: messageKey('auth.roleReceptionist'),
  MAINTENANCE_STAFF: messageKey('auth.roleMaintenance'),
  SECURITY_STAFF: messageKey('auth.roleSecurity'),
  TENANT: messageKey('auth.roleTenant'),
  ACTIVE: messageKey('auth.statusActive'),
  SUSPENDED: messageKey('auth.statusSuspended'),
  INVITED: messageKey('auth.statusInvited'),
  PENDING_VERIFICATION: messageKey('auth.statusPending'),
} as const;
