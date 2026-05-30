import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(searchParams.get('pageSize') ?? '20') || 20),
      );
      return driversService.getShiftHistory(user.id, user.role, { page, pageSize });
    }),
  );
}
