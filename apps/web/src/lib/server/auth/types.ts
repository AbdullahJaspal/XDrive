import type { Permission, UserRole } from '@uk-phv/shared-types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  operatorId: string | null;
}
