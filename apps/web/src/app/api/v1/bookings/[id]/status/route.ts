import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { updateBookingStatusSchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, [Permission.BOOKING_UPDATE], async (user) => {
      const body: unknown = await request.json();
      const parsed = updateBookingStatusSchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid status update');
      return bookingsService.updateStatus(id, parsed.data.status, user.id, parsed.data.reason);
    }),
  );
}
