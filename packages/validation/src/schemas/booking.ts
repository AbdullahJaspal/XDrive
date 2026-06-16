import { z } from 'zod';

import { geoPointSchema, ukPhoneSchema } from './common';

export const accessibilityRequirementSchema = z.enum([
  'WHEELCHAIR_ACCESSIBLE',
  'ASSISTANCE_DOG',
  'HEARING_LOOP',
  'STEP_FREE',
  'LARGE_PRINT_RECEIPT',
  'OTHER',
]);

export const createBookingSchema = z.object({
  pickup: geoPointSchema,
  dropoff: geoPointSchema,
  scheduledAt: z.string().datetime().optional(),
  passengerName: z.string().min(1).max(200).trim(),
  passengerPhone: ukPhoneSchema,
  passengerEmail: z.string().email().optional(),
  accessibilityRequirements: z.array(accessibilityRequirementSchema).default([]),
  notes: z.string().max(2000).optional(),
  source: z.enum(['WEB', 'MOBILE', 'PHONE', 'OPERATOR', 'API']).default('WEB'),
});

/** Guest web bookings — email required for confirmation and trip link. */
export const publicCreateBookingSchema = createBookingSchema.extend({
  passengerEmail: z.string().trim().email(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'DISPATCHED',
    'DRIVER_EN_ROUTE',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
  reason: z.string().max(500).optional(),
});

export const assignDriverSchema = z.object({
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type PublicCreateBookingInput = z.infer<typeof publicCreateBookingSchema>;
