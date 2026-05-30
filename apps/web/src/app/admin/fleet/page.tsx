'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DRIVER_STATUS_LABELS,
  LICENCE_STATUS_LABELS,
  VEHICLE_STATUS_LABELS,
} from '@/lib/admin/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

type FleetTab = 'drivers' | 'vehicles';

interface FleetDriver {
  id: string;
  status: string;
  employeeNumber: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  licences: { licenceNumber: string; expiryDate: string; status: string }[];
  vehicles: {
    isPrimary: boolean;
    vehicle: { registration: string; make: string; model: string };
  }[];
}

interface FleetVehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  colour: string | null;
  year: number | null;
  status: string;
  isWheelchairAccessible: boolean;
  licences: { licenceNumber: string; expiryDate: string; status: string }[];
}

function driverStatusVariant(status: string): 'success' | 'warning' | 'secondary' | 'outline' {
  if (status === 'ON_DUTY' || status === 'ACTIVE') return 'success';
  if (status === 'ON_TRIP') return 'warning';
  if (status === 'SUSPENDED') return 'outline';
  return 'secondary';
}

export default function AdminFleetPage() {
  const [tab, setTab] = useState<FleetTab>('drivers');
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    const token = getAccessToken();
    if (!token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [d, v] = await Promise.all([
        apiRequest<FleetDriver[]>('/drivers', { token }),
        apiRequest<FleetVehicle[]>('/vehicles', { token }),
      ]);
      setDrivers(d);
      setVehicles(v);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Fleet
            </Badge>
            <h1 className="text-3xl font-bold">Drivers & vehicles</h1>
            <p className="mt-1 text-muted-foreground">
              {drivers.length} driver{drivers.length === 1 ? '' : 's'}, {vehicles.length} vehicle
              {vehicles.length === 1 ? '' : 's'}
            </p>
          </div>
          <Button variant="outline" onClick={() => void load(true)} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant={tab === 'drivers' ? 'default' : 'outline'} size="sm" onClick={() => setTab('drivers')}>
            Drivers
          </Button>
          <Button variant={tab === 'vehicles' ? 'default' : 'outline'} size="sm" onClick={() => setTab('vehicles')}>
            Vehicles
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading fleet…</p>
        ) : tab === 'drivers' ? (
          <ul className="space-y-3">
            {drivers.map((driver) => {
              const licence = driver.licences[0];
              const primary = driver.vehicles.find((v) => v.isPrimary)?.vehicle ?? driver.vehicles[0]?.vehicle;
              return (
                <li key={driver.id}>
                  <Card className="surface-elevated border-0">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {driver.user.firstName} {driver.user.lastName}
                          {driver.employeeNumber ? (
                            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                              {driver.employeeNumber}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-muted-foreground">{driver.user.email}</p>
                        {driver.user.phone ? (
                          <p className="text-sm text-muted-foreground">{driver.user.phone}</p>
                        ) : null}
                        {primary ? (
                          <p className="mt-1 text-sm">
                            Vehicle: {primary.registration} ({primary.make} {primary.model})
                          </p>
                        ) : null}
                        {licence ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            PHV {licence.licenceNumber} — expires{' '}
                            {new Date(licence.expiryDate).toLocaleDateString('en-GB')} (
                            {LICENCE_STATUS_LABELS[licence.status] ?? licence.status})
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-amber-700">No PHV driver licence on file</p>
                        )}
                      </div>
                      <Badge variant={driverStatusVariant(driver.status)}>
                        {DRIVER_STATUS_LABELS[driver.status] ?? driver.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3">
            {vehicles.map((vehicle) => {
              const licence = vehicle.licences.find((l) => l) ?? vehicle.licences[0];
              return (
                <li key={vehicle.id}>
                  <Card className="surface-elevated border-0">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-lg font-semibold">{vehicle.registration}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.make} {vehicle.model}
                          {vehicle.colour ? ` · ${vehicle.colour}` : ''}
                          {vehicle.year ? ` · ${vehicle.year}` : ''}
                        </p>
                        {vehicle.isWheelchairAccessible ? (
                          <Badge variant="accent" className="mt-2">
                            Wheelchair accessible
                          </Badge>
                        ) : null}
                        {licence ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            PHV {licence.licenceNumber} — expires{' '}
                            {new Date(licence.expiryDate).toLocaleDateString('en-GB')} (
                            {LICENCE_STATUS_LABELS[licence.status] ?? licence.status})
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-amber-700">No PHV vehicle licence on file</p>
                        )}
                      </div>
                      <Badge variant={vehicle.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {VEHICLE_STATUS_LABELS[vehicle.status] ?? vehicle.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </AdminShell>
  );
}
