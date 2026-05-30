import { handleApi } from '@/lib/server/api/response';
import { prisma } from '@/lib/server/db';
import { isPusherConfigured } from '@/lib/server/realtime';

export const runtime = 'nodejs';

export async function GET() {
  return handleApi(async () => {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'up',
      realtime: isPusherConfigured() ? 'pusher' : 'disabled',
      timestamp: new Date().toISOString(),
    };
  });
}
