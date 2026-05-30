import { MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';

import { BookingStatusBadge } from '@/components/admin/booking-status-badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BookingSummary } from '@uk-phv/shared-types';

function formatWhen(iso: string | null): string {
  if (!iso) return 'ASAP';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingSummaryCard({
  booking,
  href,
}: {
  booking: BookingSummary;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="surface-elevated border-0 transition-colors hover:border-primary/20 hover:bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{booking.reference}</span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="font-medium">{booking.pickup.address}</p>
                <p className="text-muted-foreground">→ {booking.dropoff.address}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" aria-hidden />
                {booking.passengerName}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {booking.passengerPhone}
              </span>
              <span>{formatWhen(booking.scheduledAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
