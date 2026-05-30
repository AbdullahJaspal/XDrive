'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

const DUTY_CHANGED = 'driver-duty-changed';

export function dispatchDriverDutyChanged(): void {
  window.dispatchEvent(new CustomEvent(DUTY_CHANGED));
}

interface DriverMeAvailability {
  availability: { onDuty: boolean; onTrip: boolean };
}

export function DutyStatusPill() {
  const [state, setState] = useState<{ onDuty: boolean; onTrip: boolean } | null>(null);

  const refresh = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;
    void apiRequest<DriverMeAvailability>('/drivers/me', { token })
      .then((me) => { setState(me.availability); })
      .catch(() => { setState(null); });
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => { refresh(); };
    window.addEventListener(DUTY_CHANGED, onChange);
    return () => { window.removeEventListener(DUTY_CHANGED, onChange); };
  }, [refresh]);

  if (!state) return null;

  if (state.onTrip) {
    return <Badge variant="secondary">On trip</Badge>;
  }

  return (
    <Badge variant={state.onDuty ? 'success' : 'outline'}>
      {state.onDuty ? 'On duty' : 'Off duty'}
    </Badge>
  );
}
