'use client';

import Pusher from 'pusher-js';

import { DispatchEventType } from '@uk-phv/shared-types';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu';

export function isPusherEnabled(): boolean {
  return Boolean(PUSHER_KEY);
}

function bindDriverEvents(
  channel: ReturnType<Pusher['subscribe']>,
  onEvent: (eventName: string, data: unknown) => void,
): void {
  const events = [
    DispatchEventType.BOOKING_ASSIGNED,
    DispatchEventType.BOOKING_STATUS_CHANGED,
    DispatchEventType.BOOKING_UPDATED,
    DispatchEventType.DISPATCH_ALERT,
    'booking:assigned',
    'booking:status_changed',
    'booking:updated',
    'booking:cancelled',
  ];
  for (const event of events) {
    channel.bind(event, (data: unknown) => {
      onEvent(event, data);
    });
  }
}

function bindOperatorEvents(
  channel: ReturnType<Pusher['subscribe']>,
  onEvent: (eventName: string, data: unknown) => void,
): void {
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
  bindOperatorEvents(channel, onEvent);

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);
    pusher.disconnect();
  };
}

/**
 * Subscribe to driver-specific events (new assignments, status updates).
 */
export function subscribeDriverChannel(
  driverId: string,
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

  const channelName = `private-driver-${driverId}`;
  const channel = pusher.subscribe(channelName);
  bindDriverEvents(channel, onEvent);

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);
    pusher.disconnect();
  };
}
