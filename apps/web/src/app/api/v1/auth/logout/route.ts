import type { NextRequest } from 'next/server';

import { refreshTokenSchema } from '@uk-phv/validation';

import { handleApi } from '@/lib/server/api/response';
import { AppError } from '@/lib/server/errors/app.error';
import { authService } from '@/lib/server/services/auth.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () => {
    const body: unknown = await request.json();
    const parsed = refreshTokenSchema.safeParse(body);
    if (!parsed.success) throw AppError.validation('Invalid logout payload');
    return authService.logout(parsed.data.refreshToken);
  });
}
