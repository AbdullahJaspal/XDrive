import type { NextRequest } from 'next/server';

import { Permission } from '@uk-phv/shared-types';
import { z } from 'zod';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { complaintsService } from '@/lib/server/services/complaints.service';

export const runtime = 'nodejs';

const bodySchema = z.object({ resolution: z.string().min(1) });

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return handleApi(async () =>
    withAuth(request, [Permission.COMPLAINT_MANAGE], async () => {
      const body: unknown = await request.json();
      const parsed = bodySchema.safeParse(body);
      if (!parsed.success) throw AppError.validation('Invalid resolution');
      return complaintsService.resolve(id, parsed.data.resolution);
    }),
  );
}
