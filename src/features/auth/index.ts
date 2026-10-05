export { AuthGuard, RequirePermission } from './components/AuthGuard';
export { RoutePermissionGuard } from './components/RoutePermissionGuard';
export { PermissionGate } from './components/PermissionGate';
export { useHasPermission, useCan } from './hooks/use-permission';
export type { AuthApi, Me, Registration, Credentials } from './api/auth-api';

export { LoginForm } from './components/LoginForm';
export { RegistrationWizard } from './components/RegistrationWizard';
export { RecoveryForm } from './components/RecoveryForm';
export { ProfileForm } from './components/ProfileForm';
export { useAuthSubmission } from './hooks/use-auth-submission';
export { AuthErrorNotice } from './components/AuthErrorNotice';
