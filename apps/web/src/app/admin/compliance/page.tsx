'use client';

import { RefreshCw, Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/layout/admin-shell';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LICENCE_STATUS_LABELS } from '@/lib/admin/labels';
import { getAccessToken } from '@/lib/auth/session-client';
import { apiRequest } from '@/lib/api/client';

type ComplianceFilter = 'all' | 'attention';

interface ComplianceDoc {
  id: string;
  licenceType: string;
  licenceNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  status: string;
  driver: {
    user: { firstName: string; lastName: string; email: string };
  } | null;
  vehicle: { registration: string; make: string; model: string } | null;
}

function statusVariant(status: string): 'success' | 'warning' | 'outline' {
  if (status === 'VALID') return 'success';
  if (status === 'EXPIRING_SOON') return 'warning';
  return 'outline';
}

export default function AdminCompliancePage() {
  const [filter, setFilter] = useState<ComplianceFilter>('attention');
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (current: ComplianceFilter, silent = false) => {
      const token = getAccessToken();
      if (!token) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const query =
          current === 'attention' ? '?status=EXPIRING_SOON,EXPIRED,PENDING_REVIEW' : '';
        const data = await apiRequest<ComplianceDoc[]>(`/compliance/documents${query}`, {
          token,
        });
        setDocs(data);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  return (
    <AdminShell>
      <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Compliance
            </Badge>
            <h1 className="text-3xl font-bold">Licences & documents</h1>
            <p className="mt-1 text-muted-foreground">
              PHV driver and vehicle licences — dispatch is blocked when expired
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void load(filter, true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === 'attention' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('attention')}
          >
            Needs attention
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All documents
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading documents…</p>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <Shield className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'attention'
                ? 'No licences need attention right now.'
                : 'No compliance documents on file.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {docs.map((doc) => (
              <li key={doc.id}>
                <Card className="surface-elevated border-0">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {doc.licenceType === 'PHV_DRIVER' ? 'Driver PHV' : 'Vehicle PHV'} —{' '}
                        {doc.licenceNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">{doc.issuingAuthority}</p>
                      {doc.driver ? (
                        <p className="mt-1 text-sm">
                          {doc.driver.user.firstName} {doc.driver.user.lastName} (
                          {doc.driver.user.email})
                        </p>
                      ) : null}
                      {doc.vehicle ? (
                        <p className="mt-1 text-sm">
                          {doc.vehicle.registration} — {doc.vehicle.make} {doc.vehicle.model}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires {new Date(doc.expiryDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <Badge variant={statusVariant(doc.status)}>
                      {LICENCE_STATUS_LABELS[doc.status] ?? doc.status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </AdminShell>
  );
}
