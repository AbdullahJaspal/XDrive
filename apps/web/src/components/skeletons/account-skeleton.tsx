import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { ListCardsSkeleton, PageHeaderSkeleton } from '@/components/skeletons/primitives';
import { Skeleton } from '@/components/ui/skeleton';

export function AccountPageSkeleton() {
  return (
    <PageShell>
      <PageContainer className="py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeaderSkeleton />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <ListCardsSkeleton count={4} />
      </PageContainer>
    </PageShell>
  );
}
