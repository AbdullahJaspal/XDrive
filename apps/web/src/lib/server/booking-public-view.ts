import type { Booking } from '@prisma/client';

import type { PublicBookingView } from '@uk-phv/shared-types';

import { AppError } from './errors/app.error';

export function buildPublicBookingView(
  booking: Booking,
  operator: { tradingName: string | null; legalName: string },
): PublicBookingView {
  if (!booking.passengerEmail) {
    throw AppError.notFound('Booking', booking.reference);
  }

  return {
    reference: booking.reference,
    status: booking.status as PublicBookingView['status'],
    operatorName: operator.tradingName ?? operator.legalName,
    passengerName: booking.passengerName,
    passengerEmail: booking.passengerEmail,
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
    fareEstimatePence: booking.fareEstimatePence,
    accessibilityRequirements:
      booking.accessibilityRequirements as PublicBookingView['accessibilityRequirements'],
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
  };
}
