import { prisma } from '../db';

export const adminService = {
  async getDashboardStats(operatorId: string) {
    const [
      activeBookings,
      activeDrivers,
      expiringLicences,
      openComplaints,
      oldestUnassigned,
      expiringDocs,
      unresolvedComplaints,
    ] = await Promise.all([
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
      prisma.booking.findFirst({
        where: { operatorId, status: { in: ['REQUESTED', 'CONFIRMED'] }, driverId: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, reference: true, createdAt: true, passengerName: true },
      }),
      prisma.complianceDocument.findMany({
        where: {
          status: { in: ['EXPIRING_SOON', 'EXPIRED'] },
          OR: [{ driver: { operatorId } }, { vehicle: { operatorId } }],
        },
        orderBy: [{ expiryDate: 'asc' }],
        take: 5,
        select: { id: true, licenceNumber: true, status: true, expiryDate: true },
      }),
      prisma.complaint.findMany({
        where: { operatorId, status: { in: ['OPEN', 'UNDER_INVESTIGATION'] } },
        orderBy: { createdAt: 'asc' },
        take: 5,
        select: { id: true, category: true, description: true, status: true, createdAt: true },
      }),
    ]);

    return {
      activeBookings,
      activeDrivers,
      expiringLicences,
      openComplaints,
      attention: {
        oldestUnassigned,
        expiringDocs,
        unresolvedComplaints,
      },
      generatedAt: new Date().toISOString(),
    };
  },
};
