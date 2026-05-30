import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => driversService.getProfile(user.id, user.role)),
  );
}
