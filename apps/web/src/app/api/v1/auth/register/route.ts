import type { NextRequest } from 'next/server';

import { registerCustomerSchema } from '@uk-phv/validation';

import { handleApi, mapZodErrors } from '@/lib/server/api/response';
import { AppError } from '@/lib/server/errors/app.error';
import { authService } from '@/lib/server/services/auth.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () => {
    const body: unknown = await request.json();
    const parsed = registerCustomerSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation('Invalid registration payload', mapZodErrors(parsed.error));
    }
    return authService.registerCustomer(parsed.data);
  });
}
