import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { complaintsService } from '@/lib/server/services/complaints.service';

export const runtime = 'nodejs';

const createSchema = z.object({
  bookingId: z.string().uuid().optional(),
  category: z.string().min(1).max(100),
  description: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.COMPLAINT_MANAGE], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      const body: unknown = await request.json();
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid complaint');
      return complaintsService.create({
        operatorId,
        ...parsed.data,
        reporterId: user.id,
      });
    }),
  );
}

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.COMPLAINT_MANAGE], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      return complaintsService.list(operatorId);
    }),
  );
}
