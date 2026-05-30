import { PageContainer } from '@/components/layout/page-container';
import { CardBlockSkeleton, PageHeaderSkeleton } from '@/components/skeletons/primitives';

export function DriverProfileSkeleton() {
  return (
    <PageContainer className="space-y-8 py-8 sm:py-10">
        <PageHeaderSkeleton />
        <CardBlockSkeleton lines={3} />
        <CardBlockSkeleton lines={4} />
        <CardBlockSkeleton lines={2} />
    </PageContainer>
  );
}
