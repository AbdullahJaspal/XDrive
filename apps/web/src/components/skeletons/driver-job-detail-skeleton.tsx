import { PageContainer } from '@/components/layout/page-container';
import { CardBlockSkeleton } from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export function DriverJobDetailSkeleton() {
  return (
    <PageContainer className="space-y-6 py-8">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <CardBlockSkeleton lines={4} />
        <CardBlockSkeleton lines={3} />
        <Skeleton className="h-12 w-full rounded-lg" />
    </PageContainer>
  );
}
