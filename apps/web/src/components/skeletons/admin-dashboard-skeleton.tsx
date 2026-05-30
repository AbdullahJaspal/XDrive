import { PageContainer } from '@/components/layout/page-container';
import {
  CardBlockSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminDashboardSkeleton() {
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <PageHeaderSkeleton />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <StatCardsSkeleton count={4} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <CardBlockSkeleton lines={2} />
        </div>
    </PageContainer>
  );
}
