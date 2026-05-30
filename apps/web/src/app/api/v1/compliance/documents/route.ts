import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import type { LicenceStatus } from '@prisma/client';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { complianceService } from '@/lib/server/services/compliance.service';

export const runtime = 'nodejs';

const querySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? (s.split(',').map((x) => x.trim()) as LicenceStatus[])
        : undefined,
    ),
});

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.COMPLIANCE_READ], async (_user, operatorId) => {
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = querySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid query');
      return complianceService.listForOperator(operatorId, { status: parsed.data.status });
    }),
  );
}
