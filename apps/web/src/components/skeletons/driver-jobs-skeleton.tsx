import { PageContainer } from '@/components/layout/page-container';
import { ListCardsSkeleton, PageHeaderSkeleton } from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export function DriverJobsSkeleton() {
  return (
    <PageContainer className="space-y-6 py-8 sm:py-10">
        <div className="space-y-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <PageHeaderSkeleton />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <ListCardsSkeleton count={4} />
    </PageContainer>
  );
}
