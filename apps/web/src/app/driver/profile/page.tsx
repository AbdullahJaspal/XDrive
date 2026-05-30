'use client';

import {
  BadgeCheck,
  FileText,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { LicenceUploadForm } from '@/components/driver/licence-upload-form';
import { DriverProfileSkeleton } from '@/components/skeletons';
import { DriverShell } from '@/components/layout/driver-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DRIVER_STATUS_LABELS } from '@/lib/driver/labels';
import { formatFileSize } from '@/lib/driver/format';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

interface LicenceFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface LicenceRecord {
  id: string;
  licenceType: string;
  licenceNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  status: string;
  notes: string | null;
  files: LicenceFile[];
}

interface DriverProfileResponse {
  id: string;
  status: string;
  employeeNumber: string | null;
  approvedAt: string | null;
  operator: { tradingName: string | null; legalName: string; licenceNumber: string };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  vehicle: {
    registration: string;
    make: string;
    model: string;
    colour: string;
  } | null;
  licences: LicenceRecord[];
  uploads: LicenceFile[];
}

const LICENCE_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'outline'> = {
  VALID: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'outline',
};

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const data = await apiRequest<DriverProfileResponse>('/drivers/me/profile', { token });
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <DriverShell>
        <DriverProfileSkeleton />
      </DriverShell>
    );
  }

  if (error || !profile) {
    return (
      <DriverShell>
        <PageContainer className="py-16 text-center">
          <p className="text-destructive">{error ?? 'Profile unavailable'}</p>
          <Button className="mt-4" asChild>
            <Link href="/driver">Back to home</Link>
          </Button>
        </PageContainer>
      </DriverShell>
    );
  }

  const operatorName = profile.operator.tradingName ?? profile.operator.legalName;

  return (
    <DriverShell>
      <PageContainer className="space-y-8 py-8 sm:py-10">
        <div>
          <p className="label-caps text-luxury">Account</p>
          <h1 className="mt-2 text-3xl font-bold">Profile &amp; compliance</h1>
          <p className="mt-1 text-muted-foreground">
            {operatorName} · {DRIVER_STATUS_LABELS[profile.status] ?? profile.status}
          </p>
        </div>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-luxury" />
              Personal details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-lg font-medium">
              {profile.user.firstName} {profile.user.lastName}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              {profile.user.email}
            </div>
            {profile.user.phone ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {profile.user.phone}
              </div>
            ) : null}
            {profile.employeeNumber ? (
              <p>
                Employee ref{' '}
                <span className="font-mono font-medium text-foreground">
                  {profile.employeeNumber}
                </span>
              </p>
            ) : null}
            {profile.approvedAt ? (
              <p className="text-muted-foreground">
                Approved {new Date(profile.approvedAt).toLocaleDateString('en-GB')}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-luxury" />
              PHV licences on file
            </CardTitle>
            <CardDescription>
              Council-issued documents held for {profile.operator.licenceNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.licences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No licence records yet. Upload your PHV driver licence below.
              </p>
            ) : (
              profile.licences.map((licence) => (
                <div
                  key={licence.id}
                  className="rounded-xl border border-border/80 bg-secondary/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-semibold">{licence.licenceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {licence.licenceType.replace(/_/g, ' ')} · {licence.issuingAuthority}
                      </p>
                    </div>
                    <Badge variant={LICENCE_STATUS_VARIANT[licence.status] ?? 'outline'}>
                      {licence.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Expires {licence.expiryDate}
                  </p>
                  {licence.notes ? (
                    <p className="mt-2 text-sm italic text-muted-foreground">{licence.notes}</p>
                  ) : null}
                  {licence.files.length > 0 ? (
                    <ul className="mt-4 space-y-2 border-t border-border/60 pt-3">
                      {licence.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-luxury" />
                          <span className="min-w-0 flex-1 truncate">{file.originalName}</span>
                          <span className="shrink-0 text-xs">
                            {formatFileSize(file.sizeBytes)} ·{' '}
                            {new Date(file.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BadgeCheck className="h-5 w-5 text-luxury" />
              Upload licence document
            </CardTitle>
            <CardDescription>
              Submit a scan or photo for operator compliance review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LicenceUploadForm onUploaded={() => void load()} />
          </CardContent>
        </Card>

        {profile.vehicle ? (
          <Card className="surface-elevated border-0">
            <CardContent className="py-4 text-sm">
              <span className="text-muted-foreground">Assigned vehicle </span>
              <span className="font-medium">
                {profile.vehicle.colour} {profile.vehicle.make} {profile.vehicle.model} ·{' '}
                <span className="font-mono">{profile.vehicle.registration}</span>
              </span>
            </CardContent>
          </Card>
        ) : null}
      </PageContainer>
    </DriverShell>
  );
}
