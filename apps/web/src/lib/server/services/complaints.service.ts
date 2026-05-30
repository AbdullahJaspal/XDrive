import { randomBytes } from 'crypto';

import { prisma } from '../db';
import { AppError } from '../errors/app.error';
import { auditLogsService } from './audit-logs.service';

export const complaintsService = {
  async create(input: {
    operatorId: string;
    bookingId?: string;
    reporterId?: string;
    category: string;
    description: string;
  }) {
    const reference = `CMP-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    const complaint = await prisma.complaint.create({
      data: {
        operatorId: input.operatorId,
        bookingId: input.bookingId,
        reporterId: input.reporterId,
        reference,
        category: input.category,
        description: input.description,
      },
    });

    await auditLogsService.log({
      operatorId: input.operatorId,
      actorId: input.reporterId,
      action: 'CREATE',
      resourceType: 'complaint',
      resourceId: complaint.id,
    });

    return complaint;
  },

  list(operatorId: string) {
    return prisma.complaint.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async resolve(id: string, resolution: string) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw AppError.notFound('Complaint', id);
    return prisma.complaint.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedAt: new Date() },
    });
  },
};
