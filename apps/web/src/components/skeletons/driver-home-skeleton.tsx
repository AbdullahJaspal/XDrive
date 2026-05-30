import { PageContainer } from '@/components/layout/page-container';
import {
  CardBlockSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export function DriverHomeSkeleton() {
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <PageHeaderSkeleton />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <CardBlockSkeleton lines={2} />
        <StatCardsSkeleton count={3} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CardBlockSkeleton lines={4} />
          </div>
          <div className="space-y-6">
            <CardBlockSkeleton lines={2} />
            <CardBlockSkeleton lines={2} />
          </div>
        </div>
    </PageContainer>
  );
}
