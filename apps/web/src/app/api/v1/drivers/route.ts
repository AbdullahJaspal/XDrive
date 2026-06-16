import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

const querySchema = z.object({
  q: z.string().max(120).optional(),
  status: z.enum(['ACTIVE', 'ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.DRIVER_MANAGE], async (_user, operatorId) => {
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = querySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid query');
      return driversService.list(operatorId, parsed.data);
    }),
  );
}
