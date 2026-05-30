import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(64).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

const bookingStatusFilter = z.enum([
  'DRAFT',
  'REQUESTED',
  'CONFIRMED',
  'DISPATCHED',
  'DRIVER_EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const operatorBookingsQuerySchema = paginationQuerySchema.extend({
  status: bookingStatusFilter.optional(),
  /** Comma-separated statuses, e.g. REQUESTED,CONFIRMED */
  statuses: z.string().max(200).optional(),
});

export type OperatorBookingsQueryInput = z.infer<typeof operatorBookingsQuerySchema>;
