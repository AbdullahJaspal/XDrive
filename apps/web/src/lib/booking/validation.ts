import type { ApiErrorDetail } from '@uk-phv/shared-types';
import type { ZodError } from 'zod';

import type { BookingFormFields } from '@/lib/booking/payload';
import { parseCreateBookingPayload } from '@/lib/booking/payload';
import { GOOGLE_MAPS_ENABLED } from '@/lib/booking/uk-address';

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

function journeyCoordinateErrors(fields: BookingFormFields): BookingFieldErrors {
  if (!GOOGLE_MAPS_ENABLED) return {};

  const errors: BookingFieldErrors = {};
  if (fields.pickupAddress.trim() && (fields.pickupLat == null || fields.pickupLng == null)) {
    errors.pickupAddress = 'Select a UK address from the suggestions';
  }
  if (fields.dropoffAddress.trim() && (fields.dropoffLat == null || fields.dropoffLng == null)) {
    errors.dropoffAddress = 'Select a UK address from the suggestions';
  }
  return errors;
}

export function validateBookingFields(
  fields: BookingFormFields,
  keys: BookingFormFieldKey[],
): { ok: true } | { ok: false; errors: BookingFieldErrors } {
  const parsed = parseCreateBookingPayload(fields);
  const coordinateErrors = keys.some((key) => JOURNEY_FIELD_KEYS.includes(key))
    ? journeyCoordinateErrors(fields)
    : {};

  if (parsed.success && !hasFieldErrors(coordinateErrors)) return { ok: true };

  const all = parsed.success
    ? coordinateErrors
    : { ...zodErrorToFieldErrors(parsed.error), ...coordinateErrors };
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
  const coordinateErrors = journeyCoordinateErrors(fields);

  if (parsed.success && !hasFieldErrors(coordinateErrors)) {
    return { ok: true as const, data: parsed.data };
  }

  const errors = parsed.success
    ? coordinateErrors
    : { ...zodErrorToFieldErrors(parsed.error), ...coordinateErrors };
  return { ok: false as const, errors };
}
