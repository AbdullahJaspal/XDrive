import type { LicenceStatus } from '@prisma/client';

import { prisma } from '../db';

export const complianceService = {
  listForOperator(
    operatorId: string,
    options?: {
      status?: LicenceStatus[];
      q?: string;
      sortBy?: 'expiryDate' | 'status';
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const statusFilter =
      options?.status && options.status.length > 0 ? { in: options.status } : undefined;
    const sortBy = options?.sortBy ?? 'expiryDate';
    const sortOrder = options?.sortOrder ?? 'asc';

    return prisma.complianceDocument.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        OR: [{ driver: { operatorId } }, { vehicle: { operatorId } }],
        ...(options?.q
          ? {
              AND: [
                {
                  OR: [
                    { licenceNumber: { contains: options.q, mode: 'insensitive' } },
                    { issuingAuthority: { contains: options.q, mode: 'insensitive' } },
                    { driver: { user: { email: { contains: options.q, mode: 'insensitive' } } } },
                    { vehicle: { registration: { contains: options.q, mode: 'insensitive' } } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: {
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        vehicle: { select: { id: true, registration: true, make: true, model: true } },
      },
      orderBy: [{ [sortBy]: sortOrder }, { expiryDate: 'asc' }],
    });
  },
};
