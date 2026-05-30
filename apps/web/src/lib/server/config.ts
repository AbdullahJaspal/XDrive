export function getJwtConfig() {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!accessSecret || accessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
  }
  if (!refreshSecret || refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
  }
  return {
    accessSecret,
    refreshSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  };
}

export function getBookingRetentionYears(): number {
  const years = Number(process.env.BOOKING_RETENTION_YEARS ?? '2');
  return Number.isFinite(years) ? years : 2;
}

export function getStoragePath(): string {
  if (process.env.VERCEL) {
    return process.env.STORAGE_LOCAL_PATH ?? '/tmp/uploads';
  }
  return process.env.STORAGE_LOCAL_PATH ?? './uploads';
}

/** Operator used for guest web bookings (UUID or licence number e.g. WLV-DEV-001). */
export async function resolvePublicOperatorId(): Promise<string> {
  const { prisma } = await import('./db');
  const fromEnv = process.env.PUBLIC_OPERATOR_ID?.trim();
  if (fromEnv) {
    const byId = await prisma.operator.findFirst({
      where: { id: fromEnv, isActive: true },
      select: { id: true },
    });
    if (byId) return byId.id;
    const byLicence = await prisma.operator.findFirst({
      where: { licenceNumber: fromEnv, isActive: true },
      select: { id: true },
    });
    if (byLicence) return byLicence.id;
  }
  const fallback = await prisma.operator.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (!fallback) {
    throw new Error('No active operator configured for public bookings');
  }
  return fallback.id;
}
