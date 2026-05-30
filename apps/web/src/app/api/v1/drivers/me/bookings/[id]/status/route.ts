import type { NextRequest } from 'next/server';

import { updateBookingStatusSchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      const body: unknown = await request.json();
      const parsed = updateBookingStatusSchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid status update');
      return driversService.updateMyBookingStatus(
        user.id,
        user.role,
        id,
        parsed.data.status,
        parsed.data.reason,
      );
    }),
  );
}
