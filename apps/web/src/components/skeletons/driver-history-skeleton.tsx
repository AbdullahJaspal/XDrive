import { PageContainer } from '@/components/layout/page-container';
import { ListCardsSkeleton, PageHeaderSkeleton, StatCardsSkeleton } from '@/components/skeletons/primitives';

export function DriverHistorySkeleton() {
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
        <PageHeaderSkeleton />
        <StatCardsSkeleton count={2} />
        <ListCardsSkeleton count={5} />
    </PageContainer>
  );
}
