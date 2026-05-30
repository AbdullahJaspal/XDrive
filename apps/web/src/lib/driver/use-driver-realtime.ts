'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import { formatDriverRealtimeMessage } from '@/lib/driver/realtime-labels';
import { isPusherEnabled, subscribeDriverChannel } from '@/lib/realtime/pusher-client';

const POLL_MS = 30_000;

interface DriverMeId {
  id: string;
}

export interface DriverRealtimeState {
  live: boolean;
  lastMessage: string | null;
  clearLastMessage: () => void;
}

/**
 * Keeps driver views fresh via Pusher (when configured) or 30s polling.
 */
export function useDriverRealtime(onRefresh: () => void): DriverRealtimeState {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const clearLastMessage = useCallback(() => { setLastMessage(null); }, []);

  useEffect(() => {
    setLive(isPusherEnabled());
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void apiRequest<DriverMeId>('/drivers/me', { token })
      .then((me) => { setDriverId(me.id); })
      .catch(() => { setDriverId(null); });
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const token = getAccessToken();
    if (!token) return;

    let unsubscribePusher: (() => void) | undefined;

    if (isPusherEnabled()) {
      unsubscribePusher = subscribeDriverChannel(driverId, token, (event, data) => {
        setLastMessage(formatDriverRealtimeMessage(event, data));
        onRefreshRef.current();
      });
    }

    const interval = setInterval(() => {
      onRefreshRef.current();
    }, POLL_MS);

    return () => {
      unsubscribePusher?.();
      clearInterval(interval);
    };
  }, [driverId]);

  return { live, lastMessage, clearLastMessage };
}
