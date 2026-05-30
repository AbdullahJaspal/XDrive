import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { paymentsService } from '@/lib/server/services/payments.service';

export const runtime = 'nodejs';

const bodySchema = z.object({ amountPence: z.number().int().positive() });

interface Params {
  params: Promise<{ bookingId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { bookingId } = await params;
  return handleApi(async () =>
    withAuth(request, [Permission.PAYMENT_MANAGE], async () => {
      const body: unknown = await request.json();
      const parsed = bodySchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid payment payload');
      return paymentsService.createPending(bookingId, parsed.data.amountPence);
    }),
  );
}
