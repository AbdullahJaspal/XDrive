import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { PageHeaderSkeleton } from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <PageShell>
      <PageContainer className="space-y-8 py-12 sm:py-20">
        <PageHeaderSkeleton />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </PageContainer>
    </PageShell>
  );
}
