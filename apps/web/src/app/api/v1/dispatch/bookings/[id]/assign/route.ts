import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { assignDriverSchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { dispatchService } from '@/lib/server/services/dispatch.service';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, [Permission.BOOKING_DISPATCH], async (user) => {
      const body: unknown = await request.json();
      const parsed = assignDriverSchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid assign payload');
      return dispatchService.assignDriver(id, parsed.data, user.id);
    }),
  );
}
