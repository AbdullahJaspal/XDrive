import type { NextRequest } from 'next/server';

import { handleApi } from '@/lib/server/api/response';
import { withAuth } from '@/lib/server/api/route-context';
import { AppError } from '@/lib/server/errors/app.error';
import { driversService } from '@/lib/server/services/drivers.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleApi(async () =>
    withAuth(request, null, async (user) => {
      const formData = await request.formData();
      const file = formData.get('file');
      const rawNotes = formData.get('notes');
      const notes =
        typeof rawNotes === 'string' && rawNotes.trim() ? rawNotes.trim() : undefined;

      if (!(file instanceof File)) {
        throw AppError.validation('File is required');
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      return driversService.uploadLicenceDocument(user.id, user.role, {
        buffer,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: buffer.length,
        notes,
      });
    }),
  );
}
