import { prisma } from '../db';

export const vehiclesService = {
  list(operatorId: string) {
    return prisma.vehicle.findMany({
      where: { operatorId },
      include: { licences: true },
      orderBy: { registration: 'asc' },
    });
  },
};
