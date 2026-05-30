import { prisma } from '../db';

export const adminService = {
  async getDashboardStats(operatorId: string) {
    const [activeBookings, activeDrivers, expiringLicences, openComplaints] =
      await Promise.all([
        prisma.booking.count({
          where: {
            operatorId,
            status: { in: ['DISPATCHED', 'DRIVER_EN_ROUTE', 'IN_PROGRESS'] },
          },
        }),
        prisma.driver.count({
          where: { operatorId, status: { in: ['ON_DUTY', 'ACTIVE', 'ON_TRIP'] } },
        }),
        prisma.complianceDocument.count({
          where: {
            status: 'EXPIRING_SOON',
            OR: [{ driver: { operatorId } }, { vehicle: { operatorId } }],
          },
        }),
        prisma.complaint.count({
          where: { operatorId, status: { in: ['OPEN', 'UNDER_INVESTIGATION'] } },
        }),
      ]);

    return {
      activeBookings,
      activeDrivers,
      expiringLicences,
      openComplaints,
      generatedAt: new Date().toISOString(),
    };
  },
};
