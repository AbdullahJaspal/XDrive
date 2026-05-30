import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, null, async (user) => driversService.getMyBookingDetail(user.id, user.role, id)),
  );
}
