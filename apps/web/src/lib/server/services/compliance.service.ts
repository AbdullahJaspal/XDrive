import type { LicenceStatus } from '@prisma/client';

import { prisma } from '../db';

export const complianceService = {
  listForOperator(operatorId: string, options?: { status?: LicenceStatus[] }) {
    const statusFilter =
      options?.status && options.status.length > 0 ? { in: options.status } : undefined;

    return prisma.complianceDocument.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        OR: [{ driver: { operatorId } }, { vehicle: { operatorId } }],
      },
      include: {
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        vehicle: { select: { id: true, registration: true, make: true, model: true } },
      },
      orderBy: [{ expiryDate: 'asc' }],
    });
  },
};
