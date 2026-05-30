import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { paginationQuerySchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { withOperatorContext } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { usersService } from '@/lib/server/services/users.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleApi(async () =>
    withOperatorContext(request, [Permission.USER_MANAGE], async (user, operatorId) => {
      if (!user.operatorId) throw AppError.forbidden('Operator context required');
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const parsed = paginationQuerySchema.safeParse(query);
      if (!parsed.success) throw AppError.validation('Invalid pagination');
      return usersService.listByOperator(
        operatorId,
        parsed.data.page,
        parsed.data.pageSize,
      );
    }),
  );
}
