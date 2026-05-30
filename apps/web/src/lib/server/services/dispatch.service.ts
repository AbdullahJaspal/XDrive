import type { DispatchAction } from '@prisma/client';

import { prisma } from '../db';

export interface AssignDriverInput {
  driverId: string;
  vehicleId: string;
}
import { AppError } from '../errors/app.error';
import { emitToDriver, emitToOperator } from '../realtime';
import { auditLogsService } from './audit-logs.service';

export const dispatchService = {
  async assignDriver(bookingId: string, input: AssignDriverInput, performedBy: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw AppError.notFound('Booking', bookingId);

    const driver = await prisma.driver.findFirst({
      where: { id: input.driverId, operatorId: booking.operatorId, status: 'ACTIVE' },
    });
    if (!driver) {
      throw AppError.complianceBlocked('Driver is not active or not licensed for dispatch');
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: input.vehicleId, operatorId: booking.operatorId, status: 'ACTIVE' },
    });
    if (!vehicle) {
      throw AppError.complianceBlocked('Vehicle is not active for dispatch');
    }

    await validateCompliance(driver.id, vehicle.id);

    const previousData = {
      driverId: booking.driverId,
      vehicleId: booking.vehicleId,
      status: booking.status,
    };

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: input.driverId,
        vehicleId: input.vehicleId,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      },
    });

    await prisma.dispatchLog.create({
      data: {
        operatorId: booking.operatorId,
        bookingId,
        driverId: input.driverId,
        action: 'ASSIGN_DRIVER' satisfies DispatchAction,
        performedBy,
        previousData,
        newData: { driverId: input.driverId, vehicleId: input.vehicleId },
      },
    });

    await auditLogsService.log({
      operatorId: booking.operatorId,
      actorId: performedBy,
      action: 'DISPATCH',
      resourceType: 'booking',
      resourceId: bookingId,
      changes: { driverId: input.driverId, vehicleId: input.vehicleId },
    });

    await emitToOperator(booking.operatorId, 'booking:assigned', {
      bookingId,
      driverId: input.driverId,
      vehicleId: input.vehicleId,
    });
    await emitToDriver(input.driverId, 'booking:assigned', {
      bookingId,
      reference: booking.reference,
    });

    return updated;
  },
};

async function validateCompliance(driverId: string, vehicleId: string): Promise<void> {
  const now = new Date();
  const [driverLicence, vehicleLicence] = await Promise.all([
    prisma.complianceDocument.findFirst({
      where: {
        driverId,
        licenceType: 'PHV_DRIVER',
        status: { in: ['VALID', 'EXPIRING_SOON'] },
        expiryDate: { gte: now },
      },
    }),
    prisma.complianceDocument.findFirst({
      where: {
        vehicleId,
        licenceType: 'PHV_VEHICLE',
        status: { in: ['VALID', 'EXPIRING_SOON'] },
        expiryDate: { gte: now },
      },
    }),
  ]);

  if (!driverLicence) {
    throw AppError.complianceBlocked('Driver PHV licence is missing or expired');
  }
  if (!vehicleLicence) {
    throw AppError.complianceBlocked('Vehicle PHV licence is missing or expired');
  }
}
