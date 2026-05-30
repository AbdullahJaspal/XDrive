import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { ErrorCode } from '../errors/app.error';
import { AppError } from '../errors/app.error';
import { type AuthTokens, UserRole } from '@uk-phv/shared-types';
import type { LoginInput, RegisterCustomerInput } from '@uk-phv/validation';

import { prisma } from '../db';
import { signAccessToken } from '../auth/jwt';

const SALT_ROUNDS = 12;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function issueTokens(userId: string, email: string, role: UserRole): Promise<AuthTokens> {
  const accessToken = await signAccessToken(userId, email, role);
  const refreshToken = randomBytes(48).toString('hex');
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { accessToken, refreshToken, expiresIn: 900 };
}

export const authService = {
  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });
    if (!user) throw AppError.unauthorized('Invalid credentials');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid credentials');
    if (user.status !== 'ACTIVE') throw AppError.unauthorized('Account is not active');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return issueTokens(user.id, user.email, user.role as UserRole);
  },

  async registerCustomer(input: RegisterCustomerInput): Promise<AuthTokens> {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, deletedAt: null },
    });
    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, 'Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: UserRole.CUSTOMER,
        status: 'ACTIVE',
      },
    });

    return issueTokens(user.id, user.email, UserRole.CUSTOMER);
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const record = await prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!record?.user) throw AppError.unauthorized('Invalid refresh token');

    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return issueTokens(record.user.id, record.user.email, record.user.role as UserRole);
  },

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  },
};
