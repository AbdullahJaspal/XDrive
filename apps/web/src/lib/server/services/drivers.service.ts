import { prisma } from '../db';
import { AppError } from '../errors/app.error';

export const driversService = {
  list(operatorId: string) {
    return prisma.driver.findMany({
      where: { operatorId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        licences: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { user: true, licences: true, vehicles: { include: { vehicle: true } } },
    });
    if (!driver) throw AppError.notFound('Driver', id);
    return driver;
  },
};
