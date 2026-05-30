import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.DRIVER_MANAGE], async (_user, operatorId) =>
      driversService.list(operatorId),
    ),
  );
}
