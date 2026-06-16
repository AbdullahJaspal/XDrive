import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return handleApi(async () => {
    const { token } = await context.params;
    return bookingsService.findPublicViewByToken(token);
  });
}
