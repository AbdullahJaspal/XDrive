import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

import { UserRole } from '@uk-phv/shared-types';

import { authenticateRequest } from '@/lib/server/auth/session';
import { prisma } from '@/lib/server/db';
import { AppError } from '@/lib/server/errors/app.error';
export const runtime = 'nodejs';

function getPusher(): Pusher {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY ?? process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu';

  if (!appId || !key || !secret) {
    throw new Error('Pusher is not configured');
  }

  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      throw AppError.validation('Missing socket_id or channel_name');
    }

    const operatorPrefix = 'private-operator-';
    const driverPrefix = 'private-driver-';

    if (channelName.startsWith(operatorPrefix)) {
      const operatorId = channelName.slice(operatorPrefix.length);
      if (!user.operatorId || user.operatorId !== operatorId) {
        throw AppError.forbidden('Cannot subscribe to this operator channel');
      }
    } else if (channelName.startsWith(driverPrefix)) {
      const driverId = channelName.slice(driverPrefix.length);
      if (user.role !== UserRole.DRIVER) {
        throw AppError.forbidden('Driver channel requires driver role');
      }
      const driver = await prisma.driver.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!driver || driver.id !== driverId) {
        throw AppError.forbidden('Cannot subscribe to this driver channel');
      }
    } else {
      throw AppError.forbidden('Unknown channel');
    }

    const pusher = getPusher();
    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error(error);
    return NextResponse.json({ error: 'Pusher auth failed' }, { status: 500 });
  }
}
