import type { SafeguardingSeverity } from '@prisma/client';

import { prisma } from '../db';
import { auditLogsService } from './audit-logs.service';

export const safeguardingService = {
  async report(input: {
    operatorId: string;
    severity: SafeguardingSeverity;
    description: string;
    reportedBy?: string;
    bookingId?: string;
  }) {
    const reference = `SG-${Date.now().toString(36).toUpperCase()}`;
    const report = await prisma.safeguardingReport.create({
      data: {
        operatorId: input.operatorId,
        reference,
        severity: input.severity,
        description: input.description,
        reportedBy: input.reportedBy,
        bookingId: input.bookingId,
      },
    });

    await auditLogsService.log({
      operatorId: input.operatorId,
      actorId: input.reportedBy,
      action: 'CREATE',
      resourceType: 'safeguarding_report',
      resourceId: report.id,
      changes: { severity: input.severity },
    });

    return report;
  },

  list(operatorId: string) {
    return prisma.safeguardingReport.findMany({
      where: { operatorId },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  },
};
