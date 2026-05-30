import type { NextRequest } from 'next/server';

import type { Permission } from '@uk-phv/shared-types';

import {
  authenticateRequest,
  requirePermissions,
  resolveOperatorId,
} from '../auth/session';
import type { AuthenticatedUser } from '../auth/types';

export async function withAuth(
  request: NextRequest,
  permissions: Permission[] | null,
  handler: (user: AuthenticatedUser) => Promise<unknown>,
): Promise<unknown> {
  const user = await authenticateRequest(request);
  if (permissions && permissions.length > 0) {
    requirePermissions(user, permissions);
  }
  return handler(user);
}

export async function withOperatorContext(
  request: NextRequest,
  permissions: Permission[] | null,
  handler: (user: AuthenticatedUser, operatorId: string) => Promise<unknown>,
): Promise<unknown> {
  return withAuth(request, permissions, async (user) => {
    const operatorId = await resolveOperatorId(user);
    return handler(user, operatorId);
  });
}
