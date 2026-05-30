import { UserRole } from '@uk-phv/shared-types';

export type AdminNavKey = 'dashboard' | 'dispatch' | 'fleet' | 'compliance' | 'complaints';

const NAV_BY_ROLE: Record<UserRole, AdminNavKey[]> = {
  [UserRole.SUPER_ADMIN]: ['dashboard', 'dispatch', 'fleet', 'compliance', 'complaints'],
  [UserRole.OPERATOR_ADMIN]: ['dashboard', 'dispatch', 'fleet', 'compliance', 'complaints'],
  [UserRole.DISPATCHER]: ['dashboard', 'dispatch', 'fleet', 'compliance'],
  [UserRole.COMPLIANCE_OFFICER]: ['dashboard', 'compliance', 'complaints'],
  [UserRole.CUSTOMER]: [],
  [UserRole.DRIVER]: [],
};

export function adminNavForRole(role: string): AdminNavKey[] {
  return NAV_BY_ROLE[role as UserRole] ?? ['dashboard'];
}

export const ADMIN_NAV_ITEMS: {
  key: AdminNavKey;
  href: string;
  label: string;
}[] = [
  { key: 'dashboard', href: '/admin/dashboard', label: 'Dashboard' },
  { key: 'dispatch', href: '/admin/dispatch', label: 'Dispatch' },
  { key: 'fleet', href: '/admin/fleet', label: 'Fleet' },
  { key: 'compliance', href: '/admin/compliance', label: 'Compliance' },
  { key: 'complaints', href: '/admin/complaints', label: 'Complaints' },
];
