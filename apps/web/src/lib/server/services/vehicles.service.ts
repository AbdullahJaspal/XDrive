import type { VehicleStatus } from '@prisma/client';

import { prisma } from '../db';

export const vehiclesService = {
  list(
    operatorId: string,
    options?: {
      q?: string;
      status?: VehicleStatus;
      sortBy?: 'registration' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const sortBy = options?.sortBy ?? 'registration';
    const sortOrder = options?.sortOrder ?? 'asc';
    return prisma.vehicle.findMany({
      where: {
        operatorId,
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.q
          ? {
              OR: [
                { registration: { contains: options.q, mode: 'insensitive' as const } },
                { make: { contains: options.q, mode: 'insensitive' as const } },
                { model: { contains: options.q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      include: { licences: true },
      orderBy: { [sortBy]: sortOrder },
    });
  },
};
