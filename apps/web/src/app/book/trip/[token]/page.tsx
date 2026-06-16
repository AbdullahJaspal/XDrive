import { notFound } from 'next/navigation';

import { TripView } from '@/components/booking/trip-view';
import { bookingsService } from '@/lib/server/services/bookings.service';
import { AppError } from '@/lib/server/errors/app.error';

interface TripPageProps {
  params: Promise<{ token: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { token } = await params;

  try {
    const booking = await bookingsService.findPublicViewByToken(token);
    return <TripView booking={booking} token={token} />;
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}
