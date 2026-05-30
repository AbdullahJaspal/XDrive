import type { NextRequest } from 'next/server';

import type { Permission } from '@uk-phv/shared-types';

import { prisma } from '../db';
import { AppError } from '../errors/app.error';
import { verifyAccessToken } from './jwt';
import type { AuthenticatedUser } from './types';

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized();
  }
  const token = header.slice(7);
  const payload = await verifyAccessToken(token);
  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
  });
  if (user?.status !== 'ACTIVE') {
    throw AppError.unauthorized('Invalid or inactive account');
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role as AuthenticatedUser['role'],
    permissions: payload.permissions,
    operatorId: user.operatorId,
  };
}

export function requirePermissions(user: AuthenticatedUser, required: Permission[]): void {
  const hasAll = required.every((p) => user.permissions.includes(p));
  if (!hasAll) {
    throw AppError.forbidden();
  }
}

export async function resolveOperatorId(user: AuthenticatedUser): Promise<string> {
  if (user.operatorId) return user.operatorId;
  const operator = await prisma.operator.findFirst({ where: { isActive: true } });
  if (!operator) {
    throw AppError.validation('No active operator configured');
  }
  return operator.id;
}
