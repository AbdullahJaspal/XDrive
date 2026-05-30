'use client';

import dynamic from 'next/dynamic';

import { BookingWizardSkeleton } from '@/components/skeletons/booking-wizard-skeleton';
import type { BookingWizardInitial } from '@/components/booking/booking-wizard';

const BookingWizard = dynamic(
  () =>
    import('@/components/booking/booking-wizard').then((mod) => ({
      default: mod.BookingWizard,
    })),
  {
    loading: () => <BookingWizardSkeleton />,
    ssr: false,
  },
);

interface BookPageContentProps {
  initial?: BookingWizardInitial;
}

export function BookPageContent({ initial }: BookPageContentProps) {
  return <BookingWizard initial={initial} />;
}
