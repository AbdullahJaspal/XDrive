import type { Booking, BookingStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

import type {
  BookingDetail,
  BookingSummary,
  BookingStatusHistoryEntry,
  PublicBookingView,
} from '@uk-phv/shared-types';
import type { CreateBookingInput } from '@uk-phv/validation';

import { getBookingRetentionYears } from '../config';
import { buildPublicBookingView } from '../booking-public-view';
import {
  sendBookingConfirmedToPassenger,
  sendBookingRequestReceivedToPassenger,
} from '../emails/booking-confirmation';
import { sendBookingCreatedNotification } from '../emails/booking-notification';
import { prisma } from '../db';
import { AppError } from '../errors/app.error';
import { emitToDriver, emitToOperator } from '../realtime';
import { calculateFareEstimate, isAirportPickup } from '@/lib/booking/fare';
import { getDrivingRoute } from './routing.service';
import { auditLogsService } from './audit-logs.service';

export type BookingCreateResult = BookingSummary & { guestViewToken?: string };

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ['REQUESTED', 'CANCELLED'],
  REQUESTED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['DISPATCHED', 'CANCELLED', 'NO_SHOW'],
  DISPATCHED: ['DRIVER_EN_ROUTE', 'CANCELLED', 'NO_SHOW'],
  DRIVER_EN_ROUTE: ['ARRIVED', 'CANCELLED', 'NO_SHOW'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

function generateReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `PHV-${date}-${suffix}`;
}

function generateGuestAccessToken(): string {
  return randomBytes(32).toString('hex');
}

function toSummary(booking: Booking): BookingSummary {
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

function toStatusHistoryEntry(entry: {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  reason: string | null;
  createdAt: Date;
}): BookingStatusHistoryEntry {
  return {
    id: entry.id,
    fromStatus: entry.fromStatus as BookingStatusHistoryEntry['fromStatus'],
    toStatus: entry.toStatus as BookingStatusHistoryEntry['toStatus'],
    reason: entry.reason,
    createdAt: entry.createdAt.toISOString(),
  };
}

export const bookingsService = {
  async create(
    operatorId: string,
    input: CreateBookingInput,
    actorId?: string,
    customerId?: string,
  ) {
    const retentionYears = getBookingRetentionYears();
    const retentionExpiresAt = new Date();
    retentionExpiresAt.setFullYear(retentionExpiresAt.getFullYear() + retentionYears);

    const reference = generateReference();
    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
      select: { contactEmail: true, tradingName: true, legalName: true },
    });
    if (!operator) throw AppError.notFound('Operator', operatorId);

    const route = await getDrivingRoute(
      { lat: input.pickup.lat, lng: input.pickup.lng },
      { lat: input.dropoff.lat, lng: input.dropoff.lng },
    );

    const pickupIsAirport = isAirportPickup(input.pickup.address);
    const fare = route ? calculateFareEstimate(route.distanceMetres, pickupIsAirport) : null;

    const guestAccessToken =
      input.source === 'WEB' && input.passengerEmail ? generateGuestAccessToken() : undefined;

    const booking = await prisma.booking.create({
      data: {
        operator: { connect: { id: operatorId } },
        reference,
        status: 'REQUESTED',
        source: input.source,
        pickupAddress: input.pickup.address,
        pickupPostcode: input.pickup.postcode,
        pickupLat: input.pickup.lat,
        pickupLng: input.pickup.lng,
        dropoffAddress: input.dropoff.address,
        dropoffPostcode: input.dropoff.postcode,
        dropoffLat: input.dropoff.lat,
        dropoffLng: input.dropoff.lng,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        passengerName: input.passengerName,
        passengerPhone: input.passengerPhone,
        passengerEmail: input.passengerEmail,
        guestAccessToken,
        accessibilityRequirements: input.accessibilityRequirements,
        notes: input.notes,
        distanceMetres: route?.distanceMetres,
        durationSeconds: route?.durationSeconds,
        fareEstimatePence: fare?.totalPence,
        retentionExpiresAt,
        ...(customerId ? { customerId } : {}),
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        toStatus: 'REQUESTED',
        changedBy: actorId,
      },
    });

    await auditLogsService.log({
      operatorId,
      actorId,
      action: 'CREATE',
      resourceType: 'booking',
      resourceId: booking.id,
      changes: { reference, status: 'REQUESTED' },
    });

    await emitToOperator(operatorId, 'booking:created', toSummary(booking));

    void (async () => {
      try {
        await sendBookingCreatedNotification(booking, operator);
        if (booking.guestAccessToken) {
          await sendBookingRequestReceivedToPassenger(booking, operator, booking.guestAccessToken);
        }
      } catch (error: unknown) {
        console.error('Failed to send booking emails', error);
      }
    })();

    return {
      ...toSummary(booking),
      ...(booking.guestAccessToken ? { guestViewToken: booking.guestAccessToken } : {}),
    };
  },

  async findPublicViewByToken(token: string): Promise<PublicBookingView> {
    const booking = await prisma.booking.findUnique({
      where: { guestAccessToken: token },
      include: {
        operator: { select: { tradingName: true, legalName: true } },
      },
    });
    if (!booking) throw AppError.notFound('Booking', token);
    return buildPublicBookingView(booking, booking.operator);
  },

  async findById(id: string): Promise<BookingDetail> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    });
    if (!booking) throw AppError.notFound('Booking', id);
    return {
      ...toSummary(booking),
      passengerEmail: booking.passengerEmail,
      notes: booking.notes,
      distanceMetres: booking.distanceMetres,
      durationSeconds: booking.durationSeconds,
      statusHistory: booking.statusHistory.map(toStatusHistoryEntry),
    };
  },

  async listByCustomer(customerId: string, options: { page: number; pageSize: number }) {
    const skip = (options.page - 1) * options.pageSize;
    const where = { customerId };
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.pageSize,
      }),
      prisma.booking.count({ where }),
    ]);
    return {
      items: items.map(toSummary),
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: Math.ceil(total / options.pageSize),
    };
  },

  async listByOperator(
    operatorId: string,
    options: {
      page: number;
      pageSize: number;
      status?: BookingStatus;
      statuses?: BookingStatus[];
      q?: string;
      assigned?: 'assigned' | 'unassigned';
      scheduledFrom?: string;
      scheduledTo?: string;
      sortBy?: 'createdAt' | 'scheduledAt';
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const skip = (options.page - 1) * options.pageSize;
    const statusFilter =
      options.statuses && options.statuses.length > 0
        ? { in: options.statuses }
        : (options.status ?? undefined);
    const where = {
      operatorId,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(options.assigned === 'assigned' ? { driverId: { not: null } } : {}),
      ...(options.assigned === 'unassigned' ? { driverId: null } : {}),
      ...(options.scheduledFrom || options.scheduledTo
        ? {
            scheduledAt: {
              ...(options.scheduledFrom ? { gte: new Date(options.scheduledFrom) } : {}),
              ...(options.scheduledTo ? { lte: new Date(options.scheduledTo) } : {}),
            },
          }
        : {}),
      ...(options.q
        ? {
            OR: [
              { reference: { contains: options.q, mode: 'insensitive' as const } },
              { passengerName: { contains: options.q, mode: 'insensitive' as const } },
              { passengerPhone: { contains: options.q, mode: 'insensitive' as const } },
              { pickupPostcode: { contains: options.q, mode: 'insensitive' as const } },
              { dropoffPostcode: { contains: options.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'desc';
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: options.pageSize,
      }),
      prisma.booking.count({ where }),
    ]);
    return {
      items: items.map(toSummary),
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: Math.ceil(total / options.pageSize),
    };
  },

  async updateStatus(bookingId: string, toStatus: BookingStatus, actorId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        operator: { select: { tradingName: true, legalName: true } },
      },
    });
    if (!booking) throw AppError.notFound('Booking', bookingId);
    const allowed = STATUS_TRANSITIONS[booking.status];
    if (!allowed.includes(toStatus)) {
      throw AppError.validation(`Invalid status transition from ${booking.status} to ${toStatus}`);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: toStatus,
        ...(toStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
        ...(toStatus === 'CANCELLED'
          ? { cancelledAt: new Date(), cancellationReason: reason }
          : {}),
      },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        fromStatus: booking.status,
        toStatus,
        changedBy: actorId,
        reason,
      },
    });

    await auditLogsService.log({
      operatorId: booking.operatorId,
      actorId,
      action: 'UPDATE',
      resourceType: 'booking',
      resourceId: bookingId,
      changes: { from: booking.status, to: toStatus },
    });

    const summary = toSummary(updated);

    await emitToOperator(booking.operatorId, 'booking:status_changed', {
      bookingId,
      status: toStatus,
    });

    if (booking.driverId) {
      const event = toStatus === 'CANCELLED' ? 'booking:cancelled' : 'booking:status_changed';
      await emitToDriver(booking.driverId, event, summary);
    }

    if (toStatus === 'CONFIRMED' && updated.guestAccessToken) {
      void sendBookingConfirmedToPassenger(
        updated,
        booking.operator,
        updated.guestAccessToken,
      ).catch((error: unknown) => {
        console.error('Failed to send booking confirmed email', error);
      });
    }

    return summary;
  },
};
