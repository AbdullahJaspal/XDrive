import type { AuditAction, Prisma } from '@prisma/client';

import { prisma } from '../db';

export interface CreateAuditLogInput {
  operatorId?: string | null;
  actorId?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
}

export const auditLogsService = {
  async log(input: CreateAuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        operatorId: input.operatorId ?? undefined,
        actorId: input.actorId ?? undefined,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        changes: input.changes as Prisma.InputJsonValue | undefined,
      },
    });
  },

  async findByOperator(operatorId: string, options: { page: number; pageSize: number }) {
    const skip = (options.page - 1) * options.pageSize;
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.pageSize,
      }),
      prisma.auditLog.count({ where: { operatorId } }),
    ]);
    return {
      items,
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: Math.ceil(total / options.pageSize),
    };
  },
};
