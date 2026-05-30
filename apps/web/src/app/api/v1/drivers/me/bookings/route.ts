import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

const SCOPES = ['active', 'upcoming', 'history'] as const;

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      const { searchParams } = new URL(request.url);
      const scopeParam = searchParams.get('scope') ?? 'active';
      if (!SCOPES.includes(scopeParam as (typeof SCOPES)[number])) {
        throw AppError.validation('scope must be active, upcoming, or history');
      }
      const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(searchParams.get('pageSize') ?? '20') || 20),
      );
      return driversService.listMyBookings(
        user.id,
        user.role,
        scopeParam as (typeof SCOPES)[number],
        { page, pageSize },
      );
    }),
  );
}
