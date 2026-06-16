import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { vehiclesService } from '@/lib/server/services/vehicles.service';

export const runtime = 'nodejs';

const querySchema = z.object({
  q: z.string().max(120).optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'DECOMMISSIONED']).optional(),
  sortBy: z.enum(['registration', 'createdAt']).default('registration'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.VEHICLE_MANAGE], async (_user, operatorId) => {
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = querySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid query');
      return vehiclesService.list(operatorId, parsed.data);
    }),
  );
}
