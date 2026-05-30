import { BookingWizardSkeleton } from '@/components/skeletons/booking-wizard-skeleton';
import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { PageHeaderSkeleton } from '@/components/skeletons/primitives';

export function BookPageSkeleton() {
  return (
    <PageShell>
      <PageContainer className="py-12 sm:py-20">
        <PageHeaderSkeleton />
        <div className="surface-elevated mt-10 p-6 sm:p-10">
          <BookingWizardSkeleton />
        </div>
      </PageContainer>
    </PageShell>
  );
}
