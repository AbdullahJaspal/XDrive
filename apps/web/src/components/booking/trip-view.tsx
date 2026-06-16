import { Calendar, Download, Mail, MapPin, Phone, User } from 'lucide-react';
import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import {
  BOOKING_STATUS_LABELS,
  formatAccessibility,
  formatFare,
  formatScheduledAt,
} from '@/lib/booking/display';
import type { PublicBookingView } from '@uk-phv/shared-types';

interface TripViewProps {
  booking: PublicBookingView;
  token: string;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border flex gap-3 border-b py-4 last:border-b-0">
      <Icon className="text-luxury mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="label-caps text-muted-foreground">{label}</p>
        <p className="text-foreground mt-1 text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

export function TripView({ booking, token }: TripViewProps) {
  const receiptUrl = `/api/v1/public/bookings/view/${token}/receipt`;
  const whenLabel = booking.scheduledAt
    ? formatScheduledAt(new Date(booking.scheduledAt))
    : 'As soon as possible';

  return (
    <PageShell>
      <PageContainer className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="border-luxury/40 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border">
              <span className="font-display text-luxury text-2xl">✓</span>
            </div>
            <p className="label-caps text-luxury">Booking confirmed</p>
            <h1 className="font-display mt-3 text-4xl font-medium">Your trip details</h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              A confirmation email has been sent to {booking.passengerEmail}. Save this page or
              download your PDF receipt.
            </p>
          </div>

          <div className="surface-elevated border-border bg-card border p-6 sm:p-8">
            <div className="border-border mb-6 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label-caps text-muted-foreground">Reference</p>
                <p className="mt-1 font-mono text-2xl font-medium tracking-wider">
                  {booking.reference}
                </p>
              </div>
              <div className="border-luxury/30 bg-luxury/10 rounded-sm border px-3 py-1.5 text-sm">
                {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
              </div>
            </div>

            <p className="label-caps text-muted-foreground">{booking.operatorName}</p>

            <div className="mt-4">
              <DetailRow icon={User} label="Passenger" value={booking.passengerName} />
              <DetailRow icon={Mail} label="Email" value={booking.passengerEmail} />
              <DetailRow
                icon={MapPin}
                label="Pickup"
                value={`${booking.pickup.address}, ${booking.pickup.postcode}`}
              />
              <DetailRow
                icon={MapPin}
                label="Drop-off"
                value={`${booking.dropoff.address}, ${booking.dropoff.postcode}`}
              />
              <DetailRow icon={Calendar} label="When" value={whenLabel} />
              <DetailRow
                icon={Phone}
                label="Fare estimate"
                value={formatFare(booking.fareEstimatePence)}
              />
              <DetailRow
                icon={User}
                label="Accessibility"
                value={formatAccessibility(booking.accessibilityRequirements)}
              />
              {booking.notes?.trim() ? (
                <DetailRow icon={Calendar} label="Notes" value={booking.notes.trim()} />
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="accent" size="lg" asChild>
              <a
                href={receiptUrl}
                download={`booking-${booking.reference}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Download PDF receipt
              </a>
            </Button>
            <Button variant="luxury" size="lg" asChild>
              <Link href="/book">Book another journey</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
