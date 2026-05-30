import type { BookingSummary } from '@uk-phv/shared-types';

import { BOOKING_STATUS_LABELS } from '@/lib/driver/labels';

interface AssignmentPayload {
  bookingId?: string;
  reference?: string;
}

interface StatusPayload {
  bookingId?: string;
  status?: string;
  reference?: string;
}

function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const outer = data as Record<string, unknown>;
  if (outer.payload && typeof outer.payload === 'object') {
    return outer.payload as Record<string, unknown>;
  }
  return outer;
}

export function formatDriverRealtimeMessage(
  eventName: string,
  data: unknown,
): string {
  const inner = unwrapPayload(data);
  const booking = inner as Partial<BookingSummary> & AssignmentPayload & StatusPayload;
  const ref = booking.reference ?? booking.bookingId?.slice(0, 8);

  switch (eventName) {
    case 'booking:assigned':
      return ref ? `New job assigned — ${ref}` : 'New job assigned';
    case 'booking:status_changed': {
      const status = booking.status;
      const label = status ? BOOKING_STATUS_LABELS[status] ?? status : 'updated';
      return ref ? `Job ${ref} — ${label}` : `Job status — ${label}`;
    }
    case 'booking:cancelled':
      return ref ? `Job cancelled — ${ref}` : 'Job cancelled';
    case 'driver:availability': {
      const onDuty = inner.onDuty === true || inner.status === 'ON_DUTY';
      return onDuty ? 'You are now on duty' : 'You are now off duty';
    }
    case 'dispatch:alert':
      return typeof inner.message === 'string' ? inner.message : 'Dispatch alert';
    default:
      return 'Schedule updated';
  }
}
