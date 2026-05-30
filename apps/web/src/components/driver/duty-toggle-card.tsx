'use client';

import { Loader2, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DriverAvailabilityUi } from '@/lib/driver/availability';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';
import { dispatchDriverDutyChanged } from '@/components/driver/duty-status-pill';
import { cn } from '@/lib/utils';

interface DutyToggleCardProps {
  driverStatus: string;
  availability: DriverAvailabilityUi;
  onUpdated: () => void;
}

interface AvailabilityResponse {
  status: string;
  availability: DriverAvailabilityUi;
}

export function DutyToggleCard({
  driverStatus,
  availability,
  onUpdated,
}: DutyToggleCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setDuty(onDuty: boolean) {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      await apiRequest<AvailabilityResponse>('/drivers/me/availability', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ onDuty }),
      });
      dispatchDriverDutyChanged();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update availability');
    } finally {
      setLoading(false);
    }
  }

  const onDuty = availability.onDuty;

  return (
    <Card
      className={cn(
        'surface-elevated overflow-hidden border-0',
        onDuty && 'ring-1 ring-emerald-500/30',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Shift availability</CardTitle>
            <CardDescription>
              {onDuty
                ? 'You are visible to dispatch for new assignments'
                : 'Go on duty when you are ready to accept jobs'}
            </CardDescription>
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              onDuty ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground',
            )}
            aria-hidden
          >
            {onDuty ? <Power className="h-5 w-5" /> : <PowerOff className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
          <span className="text-sm font-medium">Current status</span>
          <span
            className={cn(
              'text-sm font-semibold',
              onDuty ? 'text-emerald-700' : 'text-muted-foreground',
            )}
          >
            {availability.onTrip
              ? 'On trip'
              : onDuty
                ? 'On duty'
                : driverStatus === 'OFF_DUTY'
                  ? 'Off duty'
                  : driverStatus.replace(/_/g, ' ').toLowerCase()}
          </span>
        </div>

        {availability.blockedReason && !availability.canChange ? (
          <p className="text-sm text-amber-800">{availability.blockedReason}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant={onDuty ? 'outline' : 'default'}
            className="flex-1"
            size="lg"
            disabled={loading || !availability.canGoOnDuty}
            onClick={() => void setDuty(true)}
          >
            {loading && !onDuty ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            Go on duty
          </Button>
          <Button
            type="button"
            variant={!onDuty ? 'outline' : 'secondary'}
            className="flex-1"
            size="lg"
            disabled={loading || !availability.canGoOffDuty}
            onClick={() => void setDuty(false)}
          >
            {loading && onDuty ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PowerOff className="h-4 w-4" />
            )}
            Go off duty
          </Button>
        </div>

        {availability.onDuty && availability.canGoOffDuty === false && !availability.onTrip ? (
          <p className="text-xs text-muted-foreground">
            Finish or hand off active jobs before going off duty.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
