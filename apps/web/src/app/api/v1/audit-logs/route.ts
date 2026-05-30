import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { paginationQuerySchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { auditLogsService } from '@/lib/server/services/audit-logs.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.AUDIT_READ], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = paginationQuerySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid pagination');
      return auditLogsService.findByOperator(operatorId, parsed.data);
    }),
  );
}
