import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, [Permission.BOOKING_READ], async () => bookingsService.findById(id)),
  );
}
