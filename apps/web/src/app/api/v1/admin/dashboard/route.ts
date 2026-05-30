import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { adminService } from '@/lib/server/services/admin.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.BOOKING_READ], async (user, operatorId) => {
      if (!user.operatorId && !operatorId) {
        throw AppError.forbidden('Operator context required');
      }
      return adminService.getDashboardStats(operatorId);
    }),
  );
}
