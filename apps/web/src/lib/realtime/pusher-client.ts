'use client';

import Pusher from 'pusher-js';

import { DispatchEventType } from '@uk-phv/shared-types';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu';

export function isPusherEnabled(): boolean {
  return Boolean(PUSHER_KEY);
}

/**
 * Subscribe to operator dispatch events. Returns cleanup function.
 * Falls back to no-op when Pusher env vars are not set.
 */
export function subscribeOperatorChannel(
  operatorId: string,
  accessToken: string,
  onEvent: (eventName: string, data: unknown) => void,
): () => void {
  if (!PUSHER_KEY) {
    return () => undefined;
  }

  const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const channelName = `private-operator-${operatorId}`;
  const channel = pusher.subscribe(channelName);

  const events = Object.values(DispatchEventType);
  for (const event of events) {
    channel.bind(event, (data: unknown) => {
      onEvent(event, data);
    });
  }
  channel.bind('booking:assigned', (data: unknown) => {
    onEvent('booking:assigned', data);
  });
  channel.bind('booking:created', (data: unknown) => {
    onEvent('booking:created', data);
  });
  channel.bind('booking:status_changed', (data: unknown) => {
    onEvent('booking:status_changed', data);
  });

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);
    pusher.disconnect();
  };
}
