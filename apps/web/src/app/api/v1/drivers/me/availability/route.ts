import type { NextRequest } from 'next/server';

import { updateDriverAvailabilitySchema } from '@uk-phv/validation';

import { handleApi, mapZodErrors } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      const body: unknown = await request.json();
      const parsed = updateDriverAvailabilitySchema.safeParse(body);
      if (!parsed.success) {
        throw AppError.validation('Invalid availability payload', mapZodErrors(parsed.error));
      }
      return driversService.updateAvailability(user.id, user.role, parsed.data.onDuty);
    }),
  );
}
