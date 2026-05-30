import { prisma } from '../db';
import { AppError } from '../errors/app.error';

export const usersService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        operatorId: true,
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound('User', userId);
    return { ...user, createdAt: user.createdAt.toISOString() };
  },

  listByOperator(operatorId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return prisma.user.findMany({
      where: { operatorId, deletedAt: null },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },
};
