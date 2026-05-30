import type { ApiErrorDetail } from '@uk-phv/shared-types';
import type { ZodError } from 'zod';

import type { BookingFormFields } from '@/lib/booking/payload';
import { parseCreateBookingPayload } from '@/lib/booking/payload';

export type BookingFormFieldKey =
  | 'pickupAddress'
  | 'pickupPostcode'
  | 'dropoffAddress'
  | 'dropoffPostcode'
  | 'scheduledAt'
  | 'passengerName'
  | 'passengerPhone'
  | 'passengerEmail'
  | 'notes';

export type BookingFieldErrors = Partial<Record<BookingFormFieldKey, string>>;

const ZOD_PATH_TO_FIELD: Record<string, BookingFormFieldKey> = {
  'pickup.address': 'pickupAddress',
  'pickup.postcode': 'pickupPostcode',
  'dropoff.address': 'dropoffAddress',
  'dropoff.postcode': 'dropoffPostcode',
  scheduledAt: 'scheduledAt',
  passengerName: 'passengerName',
  passengerPhone: 'passengerPhone',
  passengerEmail: 'passengerEmail',
  notes: 'notes',
};

export const JOURNEY_FIELD_KEYS: BookingFormFieldKey[] = [
  'pickupAddress',
  'pickupPostcode',
  'dropoffAddress',
  'dropoffPostcode',
];

export const DETAILS_FIELD_KEYS: BookingFormFieldKey[] = [
  'passengerName',
  'passengerPhone',
  'passengerEmail',
  'notes',
  'scheduledAt',
];

export function zodErrorToFieldErrors(error: ZodError): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const key = ZOD_PATH_TO_FIELD[path];
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function apiDetailsToFieldErrors(details: ApiErrorDetail[]): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  for (const detail of details) {
    if (!detail.field) continue;
    const key = ZOD_PATH_TO_FIELD[detail.field];
    if (key && !errors[key]) {
      errors[key] = detail.message;
    }
  }
  return errors;
}

export function pickFieldErrors(
  errors: BookingFieldErrors,
  keys: BookingFormFieldKey[],
): BookingFieldErrors {
  const picked: BookingFieldErrors = {};
  for (const key of keys) {
    if (errors[key]) picked[key] = errors[key];
  }
  return picked;
}

export function hasFieldErrors(errors: BookingFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validateBookingFields(
  fields: BookingFormFields,
  keys: BookingFormFieldKey[],
): { ok: true } | { ok: false; errors: BookingFieldErrors } {
  const parsed = parseCreateBookingPayload(fields);
  if (parsed.success) return { ok: true };

  const all = zodErrorToFieldErrors(parsed.error);
  const errors = pickFieldErrors(all, keys);
  if (!hasFieldErrors(errors)) return { ok: true };
  return { ok: false, errors };
}

export function validateJourneyStep(fields: BookingFormFields) {
  return validateBookingFields(fields, JOURNEY_FIELD_KEYS);
}

export function validateDetailsStep(fields: BookingFormFields) {
  return validateBookingFields(fields, DETAILS_FIELD_KEYS);
}

export function validateFullBooking(fields: BookingFormFields) {
  const parsed = parseCreateBookingPayload(fields);
  if (parsed.success) return { ok: true as const, data: parsed.data };
  return { ok: false as const, errors: zodErrorToFieldErrors(parsed.error) };
}
