import { randomUUID } from 'crypto';
import Pusher from 'pusher';

let server: Pusher | null = null;

function getPusherServer(): Pusher | null {
  if (server) return server;
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY ?? process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu';

  if (!appId || !key || !secret) {
    return null;
  }

  server = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
  return server;
}

export function isPusherConfigured(): boolean {
  return getPusherServer() !== null;
}

export function operatorChannel(operatorId: string): string {
  return `private-operator-${operatorId}`;
}

export function driverChannel(driverId: string): string {
  return `private-driver-${driverId}`;
}

export async function emitToOperator(
  operatorId: string,
  event: string,
  payload: unknown,
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(operatorChannel(operatorId), event, {
    type: event,
    payload,
    operatorId,
    timestamp: new Date().toISOString(),
    correlationId: randomUUID(),
  });
}

export async function emitToDriver(
  driverId: string,
  event: string,
  payload: unknown,
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;

  await pusher.trigger(driverChannel(driverId), event, {
    type: event,
    payload,
    driverId,
    timestamp: new Date().toISOString(),
    correlationId: randomUUID(),
  });
}
