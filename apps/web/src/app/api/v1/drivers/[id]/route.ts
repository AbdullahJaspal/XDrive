import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';

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
    withAuth(request, [Permission.DRIVER_MANAGE], async () => driversService.get(id)),
  );
}
