'use client';

import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DRIVER_STATUS_LABELS } from '@/lib/admin/labels';
import { ApiClientError, apiRequest } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session-client';

export interface DispatchDriverOption {
  id: string;
  status: string;
  employeeNumber: string | null;
  user: { firstName: string; lastName: string; phone: string | null };
  vehicles: {
    isPrimary: boolean;
    vehicle: {
      id: string;
      registration: string;
      make: string;
      model: string;
      status: string;
    };
  }[];
}

interface AssignDriverPanelProps {
  bookingId: string;
  drivers: DispatchDriverOption[];
  onAssigned: () => void;
}

export function AssignDriverPanel({ bookingId, drivers, onAssigned }: AssignDriverPanelProps) {
  const available = useMemo(
    () => drivers.filter((d) => d.status === 'ON_DUTY' || d.status === 'ACTIVE'),
    [drivers],
  );

  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedDriver = available.find((d) => d.id === driverId);
  const vehicleOptions = selectedDriver?.vehicles.map((v) => v.vehicle) ?? [];

  function handleDriverChange(id: string) {
    setDriverId(id);
    const driver = available.find((d) => d.id === id);
    const primary = driver?.vehicles.find((v) => v.isPrimary)?.vehicle ?? driver?.vehicles[0]?.vehicle;
    setVehicleId(primary?.id ?? '');
    setError(null);
  }

  function handleAssign() {
    if (!driverId || !vehicleId) {
      setError('Select a driver and vehicle.');
      return;
    }
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    void apiRequest(`/dispatch/bookings/${bookingId}/assign`, {
      method: 'POST',
      token,
      body: JSON.stringify({ driverId, vehicleId }),
    })
      .then(() => onAssigned())
      .catch((err) => {
        if (err instanceof ApiClientError && err.code === 'COMPLIANCE_BLOCKED') {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : 'Assignment failed');
        }
      })
      .finally(() => setLoading(false));
  }

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No drivers on duty. Drivers must toggle on duty in the driver app before dispatch.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assign-driver">Driver</Label>
        <select
          id="assign-driver"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={driverId}
          onChange={(e) => handleDriverChange(e.target.value)}
        >
          <option value="">Select driver…</option>
          {available.map((d) => (
            <option key={d.id} value={d.id}>
              {d.user.firstName} {d.user.lastName}
              {d.employeeNumber ? ` (${d.employeeNumber})` : ''} —{' '}
              {DRIVER_STATUS_LABELS[d.status] ?? d.status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assign-vehicle">Vehicle</Label>
        <select
          id="assign-vehicle"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={vehicleId}
          onChange={(e) => {
            setVehicleId(e.target.value);
            setError(null);
          }}
          disabled={!driverId}
        >
          <option value="">Select vehicle…</option>
          {vehicleOptions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} — {v.make} {v.model}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button onClick={handleAssign} disabled={loading || !driverId || !vehicleId}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Assigning…
          </>
        ) : (
          'Assign driver'
        )}
      </Button>
    </div>
  );
}
