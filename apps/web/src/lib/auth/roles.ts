import { UserRole } from '@uk-phv/shared-types';

const OPERATOR_STAFF_ROLES: ReadonlySet<UserRole> = new Set([
  UserRole.SUPER_ADMIN,
  UserRole.OPERATOR_ADMIN,
  UserRole.DISPATCHER,
  UserRole.COMPLIANCE_OFFICER,
]);

/** Operator back-office (dispatch, admin, compliance) — not drivers. */
export function isOperatorStaffRole(role: string): boolean {
  return OPERATOR_STAFF_ROLES.has(role as UserRole);
}

export function isDriverRole(role: string): boolean {
  return role === UserRole.DRIVER;
}

/** @deprecated Use isOperatorStaffRole or isDriverRole */
export function isStaffRole(role: string): boolean {
  return isOperatorStaffRole(role) || isDriverRole(role);
}

export function getPostLoginPath(role: string): string {
  if (isDriverRole(role)) return '/driver';
  if (isOperatorStaffRole(role)) return '/admin/dashboard';
  return '/account';
}
