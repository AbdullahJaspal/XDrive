import { AdminShell } from '@/components/layout/admin-shell';
import { AdminDashboardSkeleton } from '@/components/skeletons';

export default function AdminLoading() {
  return (
    <AdminShell>
      <AdminDashboardSkeleton />
    </AdminShell>
  );
}
