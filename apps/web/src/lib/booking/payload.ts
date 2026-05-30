import { createBookingSchema } from '@uk-phv/validation';
import type { CreateBookingInput } from '@uk-phv/validation';
import type { ZodError } from 'zod';

import { DEFAULT_COORDS } from '@/lib/booking/defaults';

export interface BookingFormFields {
  pickupAddress: string;
  pickupPostcode: string;
  dropoffAddress: string;
  dropoffPostcode: string;
  scheduledAt: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  notes: string;
  accessibility: CreateBookingInput['accessibilityRequirements'];
}

export function buildCreateBookingPayload(fields: BookingFormFields): CreateBookingInput {
  return {
    pickup: {
      ...DEFAULT_COORDS,
      address: fields.pickupAddress.trim(),
      postcode: fields.pickupPostcode.trim(),
    },
    dropoff: {
      ...DEFAULT_COORDS,
      address: fields.dropoffAddress.trim(),
      postcode: fields.dropoffPostcode.trim(),
    },
    scheduledAt: fields.scheduledAt
      ? new Date(fields.scheduledAt).toISOString()
      : undefined,
    passengerName: fields.passengerName.trim(),
    passengerPhone: fields.passengerPhone.trim(),
    passengerEmail: fields.passengerEmail.trim() || undefined,
    accessibilityRequirements: fields.accessibility,
    notes: fields.notes.trim() || undefined,
    source: 'WEB',
  };
}

export function parseCreateBookingPayload(fields: BookingFormFields) {
  return createBookingSchema.safeParse(buildCreateBookingPayload(fields));
}

export function formatZodFieldErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join('.');
      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join('; ');
}
