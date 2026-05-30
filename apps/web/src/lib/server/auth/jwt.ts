import { SignJWT, jwtVerify } from 'jose';

import type { JwtPayload, UserRole } from '@uk-phv/shared-types';
import { ROLE_PERMISSIONS } from '@uk-phv/shared-types';

import { getJwtConfig } from '../config';

function getAccessSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtConfig().accessSecret);
}

export async function signAccessToken(
  userId: string,
  email: string,
  role: UserRole,
): Promise<string> {
  const { accessExpiresIn } = getJwtConfig();
  const permissions = ROLE_PERMISSIONS[role];
  const payload: JwtPayload = { sub: userId, email, role, permissions };

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(accessExpiresIn)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as unknown as JwtPayload;
}
