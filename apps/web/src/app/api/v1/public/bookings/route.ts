import type { NextRequest } from 'next/server';

import { UserRole } from '@uk-phv/shared-types';
import { createBookingSchema } from '@uk-phv/validation';

import { authenticateRequest } from '@/lib/server/auth/session';
import { handleApi, mapZodErrors } from '@/lib/server/api/response';
import { resolvePublicOperatorId } from '@/lib/server/config';
import { AppError } from '@/lib/server/errors/app.error';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () => {
    const body: unknown = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation('Invalid booking payload', mapZodErrors(parsed.error));
    }

    let customerId: string | undefined;
    const header = request.headers.get('authorization');
    if (header?.startsWith('Bearer ')) {
      try {
        const user = await authenticateRequest(request);
        if (user.role === UserRole.CUSTOMER) {
          customerId = user.id;
        }
      } catch {
        /* guest booking */
      }
    }

    const operatorId = await resolvePublicOperatorId();
    return bookingsService.create(operatorId, parsed.data, customerId, customerId);
  });
}
