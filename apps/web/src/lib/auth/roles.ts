import { UserRole } from '@uk-phv/shared-types';

const STAFF_ROLES: ReadonlySet<UserRole> = new Set([
  UserRole.SUPER_ADMIN,
  UserRole.OPERATOR_ADMIN,
  UserRole.DISPATCHER,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.DRIVER,
]);

export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.has(role as UserRole);
}

export function getPostLoginPath(role: string): string {
  if (isStaffRole(role)) return '/admin/dashboard';
  return '/account';
}
