import { DriverShell } from '@/components/layout/driver-shell';
import { DriverHomeSkeleton } from '@/components/skeletons';

export default function DriverLoading() {
  return (
    <DriverShell>
      <DriverHomeSkeleton />
    </DriverShell>
  );
}
