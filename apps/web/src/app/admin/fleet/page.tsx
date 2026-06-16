'use client';

import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [q, setQ] = useState('');
  const [driverStatus, setDriverStatus] = useState('all');
  const [vehicleStatus, setVehicleStatus] = useState('all');

  const load = useCallback(
    async (silent = false) => {
      const token = getAccessToken();
      if (!token) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const [d, v] = await Promise.all([
          apiRequest<FleetDriver[]>(
            `/drivers?${new URLSearchParams({
              ...(q ? { q } : {}),
              ...(driverStatus !== 'all' ? { status: driverStatus } : {}),
              sortBy: 'name',
              sortOrder: 'asc',
            }).toString()}`,
            { token },
          ),
          apiRequest<FleetVehicle[]>(
            `/vehicles?${new URLSearchParams({
              ...(q ? { q } : {}),
              ...(vehicleStatus !== 'all' ? { status: vehicleStatus } : {}),
              sortBy: 'registration',
              sortOrder: 'asc',
            }).toString()}`,
            { token },
          ),
        ]);
        setDrivers(d);
        setVehicles(v);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [driverStatus, q, vehicleStatus],
  );

  useEffect(() => {
    void load();
  }, [load, q, driverStatus, vehicleStatus]);

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Fleet
            </Badge>
            <h1 className="text-3xl font-bold">Drivers & vehicles</h1>
            <p className="text-muted-foreground mt-1">
              {drivers.length} driver{drivers.length === 1 ? '' : 's'}, {vehicles.length} vehicle
              {vehicles.length === 1 ? '' : 's'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void load(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tab === 'drivers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setTab('drivers');
            }}
          >
            Drivers
          </Button>
          <Button
            variant={tab === 'vehicles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setTab('vehicles');
            }}
          >
            Vehicles
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Search by name, email, reg"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
            }}
          />
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={driverStatus}
            onChange={(event) => {
              setDriverStatus(event.target.value);
            }}
          >
            <option value="all">All driver statuses</option>
            <option value="ON_DUTY">On duty</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_TRIP">On trip</option>
            <option value="OFF_DUTY">Off duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            className="border-border bg-background h-10 rounded-md border px-3 text-sm"
            value={vehicleStatus}
            onChange={(event) => {
              setVehicleStatus(event.target.value);
            }}
          >
            <option value="all">All vehicle statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading fleet…</p>
        ) : tab === 'drivers' ? (
          <ul className="space-y-3">
            {drivers.map((driver) => {
              const licence = driver.licences[0];
              const primary =
                driver.vehicles.find((v) => v.isPrimary)?.vehicle ?? driver.vehicles[0]?.vehicle;
              return (
                <li key={driver.id}>
                  <Card className="surface-elevated border-0">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          {driver.user.firstName} {driver.user.lastName}
                          {driver.employeeNumber ? (
                            <span className="text-muted-foreground ml-2 font-mono text-sm font-normal">
                              {driver.employeeNumber}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-muted-foreground text-sm">{driver.user.email}</p>
                        {driver.user.phone ? (
                          <p className="text-muted-foreground text-sm">{driver.user.phone}</p>
                        ) : null}
                        {primary ? (
                          <p className="mt-1 text-sm">
                            Vehicle: {primary.registration} ({primary.make} {primary.model})
                          </p>
                        ) : null}
                        {licence ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            PHV {licence.licenceNumber} — expires{' '}
                            {new Date(licence.expiryDate).toLocaleDateString('en-GB')} (
                            {LICENCE_STATUS_LABELS[licence.status] ?? licence.status})
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-amber-700">
                            No PHV driver licence on file
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/admin/compliance?status=PENDING_REVIEW">
                              Review compliance
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/admin/dispatch?assigned=unassigned">
                              Open dispatch board
                            </Link>
                          </Button>
                        </div>
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
              const licence = vehicle.licences[0];
              return (
                <li key={vehicle.id}>
                  <Card className="surface-elevated border-0">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-lg font-semibold">{vehicle.registration}</p>
                        <p className="text-muted-foreground text-sm">
                          {vehicle.make} {vehicle.model}
                          {vehicle.colour ? ` · ${vehicle.colour}` : ''}
                          {vehicle.year != null ? ` · ${String(vehicle.year)}` : ''}
                        </p>
                        {vehicle.isWheelchairAccessible ? (
                          <Badge variant="accent" className="mt-2">
                            Wheelchair accessible
                          </Badge>
                        ) : null}
                        {licence ? (
                          <p className="text-muted-foreground mt-2 text-xs">
                            PHV {licence.licenceNumber} — expires{' '}
                            {new Date(licence.expiryDate).toLocaleDateString('en-GB')} (
                            {LICENCE_STATUS_LABELS[licence.status] ?? licence.status})
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-amber-700">
                            No PHV vehicle licence on file
                          </p>
                        )}
                        <div className="mt-3">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/admin/compliance?status=EXPIRING_SOON,EXPIRED">
                              Review licences
                            </Link>
                          </Button>
                        </div>
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
