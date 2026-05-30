import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { createBookingSchema, operatorBookingsQuerySchema } from '@uk-phv/validation';
import type { BookingStatus } from '@prisma/client';

import { handleApi, mapZodErrors } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.BOOKING_CREATE], async (user, operatorId) => {
      const body: unknown = await request.json();
      const parsed = createBookingSchema.safeParse(body);
      if (!parsed.success) {
        throw AppError.validation('Invalid booking payload', mapZodErrors(parsed.error));
      }
      return bookingsService.create(operatorId, parsed.data, user.id);
    }),
  );
}

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.BOOKING_READ], async (_user, operatorId) => {
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = operatorBookingsQuerySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid pagination');
      const statuses = parsed.data.statuses
        ? (parsed.data.statuses.split(',').map((s) => s.trim()) as BookingStatus[])
        : undefined;
      return bookingsService.listByOperator(operatorId, {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        status: parsed.data.status,
        statuses,
      });
    }),
  );
}
