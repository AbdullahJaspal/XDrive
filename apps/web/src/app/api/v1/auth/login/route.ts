import type { NextRequest } from 'next/server';

import { loginSchema } from '@uk-phv/validation';

import { mapZodErrors } from '@/lib/server/api/response';
import { handleApi } from '@/lib/server/api/response';
import { AppError } from '@/lib/server/errors/app.error';
import { authService } from '@/lib/server/services/auth.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () => {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation('Invalid login payload', mapZodErrors(parsed.error));
    }
    return authService.login(parsed.data);
  });
}
