import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { safeguardingService } from '@/lib/server/services/safeguarding.service';

export const runtime = 'nodejs';

const createSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(10).max(10000),
  bookingId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.SAFEGUARDING_MANAGE], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      const body: unknown = await request.json();
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid safeguarding report');
      return safeguardingService.report({
        operatorId,
        severity: parsed.data.severity,
        description: parsed.data.description,
        bookingId: parsed.data.bookingId,
        reportedBy: user.id,
      });
    }),
  );
}

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.SAFEGUARDING_MANAGE], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      return safeguardingService.list(operatorId);
    }),
  );
}
