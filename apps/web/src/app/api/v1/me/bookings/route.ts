import type { NextRequest } from 'next/server';

import { UserRole } from '@uk-phv/shared-types';
import { paginationQuerySchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      if (user.role !== UserRole.CUSTOMER) {
        throw AppError.forbidden('Only customer accounts can list personal bookings');
      }
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = paginationQuerySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid pagination');
      return bookingsService.listByCustomer(user.id, parsed.data);
    }),
  );
}
