import type { Booking, BookingStatus, DriverStatus } from '@prisma/client';

import type { BookingSummary } from '@uk-phv/shared-types';
import { DispatchEventType, UserRole } from '@uk-phv/shared-types';

import { buildAvailabilityUi } from '@/lib/driver/availability';
import { getNextDriverAction } from '@/lib/driver/status-actions';
import { prisma } from '../db';
import { AppError } from '../errors/app.error';
import { emitToDriver, emitToOperator } from '../realtime';

import { storageService } from './storage.service';
import { bookingsService } from './bookings.service';

const ACTIVE_JOB_STATUSES: BookingStatus[] = [
  'DISPATCHED',
  'DRIVER_EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
];

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toBookingSummary(booking: Booking): BookingSummary {
  return {
    id: booking.id,
    reference: booking.reference,
    status: booking.status as BookingSummary['status'],
    source: booking.source as BookingSummary['source'],
    pickup: {
      lat: booking.pickupLat,
      lng: booking.pickupLng,
      address: booking.pickupAddress,
      postcode: booking.pickupPostcode,
    },
    dropoff: {
      lat: booking.dropoffLat,
      lng: booking.dropoffLng,
      address: booking.dropoffAddress,
      postcode: booking.dropoffPostcode,
    },
    scheduledAt: booking.scheduledAt?.toISOString() ?? null,
    passengerName: booking.passengerName,
    passengerPhone: booking.passengerPhone,
    accessibilityRequirements:
      booking.accessibilityRequirements as BookingSummary['accessibilityRequirements'],
    driverId: booking.driverId,
    vehicleId: booking.vehicleId,
    fareEstimatePence: booking.fareEstimatePence,
    createdAt: booking.createdAt.toISOString(),
  };
}

async function requireDriverForUser(userId: string, role: string) {
  if (role !== UserRole.DRIVER) {
    throw AppError.forbidden('Driver access only');
  }
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      operator: {
        select: { id: true, tradingName: true, legalName: true, licenceNumber: true },
      },
      vehicles: {
        where: { endedAt: null },
        include: { vehicle: true },
        orderBy: [{ isPrimary: 'desc' }, { assignedAt: 'desc' }],
        take: 1,
      },
      licences: {
        where: { licenceType: 'PHV_DRIVER' },
        orderBy: { expiryDate: 'desc' },
        take: 1,
      },
    },
  });
  if (!driver) {
    throw AppError.forbidden('No driver profile linked to this account');
  }
  return driver;
}

export const driversService = {
  list(operatorId: string) {
    return prisma.driver.findMany({
      where: { operatorId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        licences: { where: { licenceType: 'PHV_DRIVER' }, orderBy: { expiryDate: 'desc' } },
        vehicles: {
          where: { endedAt: null },
          include: { vehicle: true },
          orderBy: [{ isPrimary: 'desc' }, { assignedAt: 'desc' }],
        },
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

  async getMe(userId: string, role: string) {
    const driver = await requireDriverForUser(userId, role);
    const primaryAssignment = driver.vehicles[0];
    const phvLicence = driver.licences[0];

    const [activeJobs, todayCompleted, upcomingCount] = await Promise.all([
      prisma.booking.findMany({
        where: { driverId: driver.id, status: { in: ACTIVE_JOB_STATUSES } },
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      prisma.booking.count({
        where: {
          driverId: driver.id,
          status: 'COMPLETED',
          completedAt: { gte: startOfTodayUtc() },
        },
      }),
      prisma.booking.count({
        where: {
          driverId: driver.id,
          status: { in: ['CONFIRMED', 'DISPATCHED'] },
          scheduledAt: { gte: new Date() },
        },
      }),
    ]);

    return {
      id: driver.id,
      status: driver.status,
      employeeNumber: driver.employeeNumber,
      operator: driver.operator,
      user: driver.user,
      vehicle: primaryAssignment
        ? {
            id: primaryAssignment.vehicle.id,
            registration: primaryAssignment.vehicle.registration,
            make: primaryAssignment.vehicle.make,
            model: primaryAssignment.vehicle.model,
            colour: primaryAssignment.vehicle.colour,
            isWheelchairAccessible: primaryAssignment.vehicle.isWheelchairAccessible,
          }
        : null,
      phvLicence: phvLicence
        ? {
            licenceNumber: phvLicence.licenceNumber,
            expiryDate: phvLicence.expiryDate.toISOString().slice(0, 10),
            status: phvLicence.status,
          }
        : null,
      stats: {
        activeJobs: activeJobs.length,
        todayCompleted,
        upcomingCount,
      },
      activeJob: activeJobs[0] ? toBookingSummary(activeJobs[0]) : null,
      availability: buildAvailabilityUi(driver.status, activeJobs.length),
    };
  },

  async updateAvailability(userId: string, role: string, onDuty: boolean) {
    const driver = await requireDriverForUser(userId, role);
    const activeJobCount = await prisma.booking.count({
      where: { driverId: driver.id, status: { in: ACTIVE_JOB_STATUSES } },
    });

    const ui = buildAvailabilityUi(driver.status, activeJobCount);

    if (onDuty && !ui.canGoOnDuty) {
      throw AppError.validation(ui.blockedReason ?? 'Cannot go on duty');
    }
    if (!onDuty && !ui.canGoOffDuty) {
      throw AppError.validation(
        ui.blockedReason ?? 'Cannot go off duty while jobs are active',
      );
    }

    const newStatus: DriverStatus = onDuty ? 'ON_DUTY' : 'OFF_DUTY';
    await prisma.driver.update({
      where: { id: driver.id },
      data: { status: newStatus },
    });

    const availabilityPayload = {
      driverId: driver.id,
      status: newStatus,
      onDuty,
      driverName: `${driver.user.firstName} ${driver.user.lastName}`,
    };

    await emitToOperator(
      driver.operatorId,
      DispatchEventType.DRIVER_AVAILABILITY,
      availabilityPayload,
    );
    await emitToDriver(
      driver.id,
      DispatchEventType.DRIVER_AVAILABILITY,
      availabilityPayload,
    );

    return {
      status: newStatus,
      availability: buildAvailabilityUi(newStatus, activeJobCount),
    };
  },

  async listMyBookings(
    userId: string,
    role: string,
    scope: 'active' | 'upcoming' | 'history',
    options: { page: number; pageSize: number },
  ) {
    const driver = await requireDriverForUser(userId, role);
    const skip = (options.page - 1) * options.pageSize;

    const where =
      scope === 'active'
        ? { driverId: driver.id, status: { in: ACTIVE_JOB_STATUSES } }
        : scope === 'upcoming'
          ? { driverId: driver.id, status: { in: ['CONFIRMED', 'DISPATCHED'] as BookingStatus[] } }
          : {
              driverId: driver.id,
              status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] as BookingStatus[] },
            };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: scope === 'history' ? { completedAt: 'desc' } : { scheduledAt: 'asc' },
        skip,
        take: options.pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items: items.map(toBookingSummary),
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: Math.ceil(total / options.pageSize),
    };
  },

  async getMyBookingDetail(userId: string, role: string, bookingId: string) {
    const driver = await requireDriverForUser(userId, role);
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: driver.id },
      include: {
        vehicle: {
          select: { registration: true, make: true, model: true, colour: true },
        },
      },
    });
    if (!booking) throw AppError.notFound('Booking', bookingId);
    return {
      ...toBookingSummary(booking),
      notes: booking.notes,
      passengerEmail: booking.passengerEmail,
      vehicle: booking.vehicle,
      dispatchedAt: booking.dispatchedAt?.toISOString() ?? null,
      startedAt: booking.startedAt?.toISOString() ?? null,
      completedAt: booking.completedAt?.toISOString() ?? null,
    };
  },

  async updateMyBookingStatus(
    userId: string,
    role: string,
    bookingId: string,
    toStatus: BookingStatus,
    reason?: string,
  ) {
    const driver = await requireDriverForUser(userId, role);
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, driverId: driver.id },
    });
    if (!booking) throw AppError.notFound('Booking', bookingId);

    const allowed = getNextDriverAction(booking.status);
    if (!allowed || allowed.status !== toStatus) {
      throw AppError.validation(
        `Cannot change status from ${booking.status} to ${toStatus}`,
      );
    }

    const updated = await bookingsService.updateStatus(bookingId, toStatus, userId, reason);

    if (toStatus === 'DRIVER_EN_ROUTE' || toStatus === 'IN_PROGRESS') {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { status: 'ON_TRIP' },
      });
    } else if (toStatus === 'COMPLETED') {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { status: 'ON_DUTY' },
      });
    }

    return updated;
  },

  async getProfile(userId: string, role: string) {
    const driver = await requireDriverForUser(userId, role);

    const licences = await prisma.complianceDocument.findMany({
      where: { driverId: driver.id },
      orderBy: { expiryDate: 'desc' },
      include: {
        files: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
        },
      },
    });

    const uploads = await storageService.listForDriverLicence(driver.id);

    return {
      id: driver.id,
      status: driver.status,
      employeeNumber: driver.employeeNumber,
      approvedAt: driver.approvedAt?.toISOString() ?? null,
      operator: driver.operator,
      user: driver.user,
      vehicle: driver.vehicles[0]
        ? {
            registration: driver.vehicles[0].vehicle.registration,
            make: driver.vehicles[0].vehicle.make,
            model: driver.vehicles[0].vehicle.model,
            colour: driver.vehicles[0].vehicle.colour,
          }
        : null,
      licences: licences.map((licence) => ({
        id: licence.id,
        licenceType: licence.licenceType,
        licenceNumber: licence.licenceNumber,
        issuingAuthority: licence.issuingAuthority,
        expiryDate: licence.expiryDate.toISOString().slice(0, 10),
        status: licence.status,
        notes: licence.notes,
        files: licence.files.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
        })),
      })),
      uploads: uploads.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      })),
    };
  },

  async getShiftHistory(
    userId: string,
    role: string,
    options: { page: number; pageSize: number },
  ) {
    const driver = await requireDriverForUser(userId, role);
    const skip = (options.page - 1) * options.pageSize;

    const historyWhere = {
      driverId: driver.id,
      status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] as BookingStatus[] },
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [items, total, last30Completed, allTimeCompleted] = await Promise.all([
      prisma.booking.findMany({
        where: historyWhere,
        orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: options.pageSize,
      }),
      prisma.booking.count({ where: historyWhere }),
      prisma.booking.findMany({
        where: {
          driverId: driver.id,
          status: 'COMPLETED',
          completedAt: { gte: thirtyDaysAgo },
        },
        select: {
          fareFinalPence: true,
          fareEstimatePence: true,
          completedAt: true,
        },
      }),
      prisma.booking.count({
        where: { driverId: driver.id, status: 'COMPLETED' },
      }),
    ]);

    const last30EarningsPence = last30Completed.reduce((sum, b) => {
      const pence = b.fareFinalPence ?? b.fareEstimatePence ?? 0;
      return sum + pence;
    }, 0);

    return {
      items: items.map((b) => ({
        ...toBookingSummary(b),
        completedAt: b.completedAt?.toISOString() ?? null,
        farePence: b.fareFinalPence ?? b.fareEstimatePence,
      })),
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: Math.ceil(total / options.pageSize),
      summary: {
        last30Days: {
          trips: last30Completed.length,
          earningsPence: last30EarningsPence,
        },
        allTimeCompleted,
      },
    };
  },

  async uploadLicenceDocument(
    userId: string,
    role: string,
    input: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      notes?: string;
    },
  ) {
    const driver = await requireDriverForUser(userId, role);

    let licence = await prisma.complianceDocument.findFirst({
      where: { driverId: driver.id, licenceType: 'PHV_DRIVER' },
      orderBy: { createdAt: 'desc' },
    });

    if (!licence) {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      licence = await prisma.complianceDocument.create({
        data: {
          driverId: driver.id,
          licenceType: 'PHV_DRIVER',
          licenceNumber: driver.employeeNumber
            ? `PENDING-${driver.employeeNumber}`
            : `PENDING-${driver.id.slice(0, 8).toUpperCase()}`,
          issuingAuthority: 'Awaiting operator verification',
          expiryDate: expiry,
          status: 'EXPIRING_SOON',
          notes:
            input.notes ??
            'Licence document uploaded by driver — pending operator verification.',
        },
      });
    } else if (input.notes) {
      await prisma.complianceDocument.update({
        where: { id: licence.id },
        data: {
          notes: licence.notes
            ? `${licence.notes}\n${input.notes}`
            : input.notes,
        },
      });
    }

    const file = await storageService.storeFile({
      entityType: 'DRIVER_LICENCE',
      entityId: driver.id,
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      buffer: input.buffer,
      uploadedBy: userId,
      complianceDocumentId: licence.id,
    });

    return {
      file: {
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        createdAt: file.createdAt.toISOString(),
      },
      licence: {
        id: licence.id,
        licenceNumber: licence.licenceNumber,
        status: licence.status,
      },
    };
  },
};
