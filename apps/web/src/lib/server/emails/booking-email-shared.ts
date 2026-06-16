import type { Booking } from '@prisma/client';

import {
  BOOKING_STATUS_LABELS,
  formatAccessibility,
  formatFare,
  formatScheduledAt,
} from '@/lib/booking/display';

export {
  ACCESSIBILITY_LABELS,
  BOOKING_STATUS_LABELS,
  formatAccessibility,
  formatFare,
  formatScheduledAt,
} from '@/lib/booking/display';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function optionalText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed;
}

export function getSiteUrl(): string | null {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? null;
}

export function guestTripUrl(token: string): string | null {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/book/trip/${token}` : null;
}

export function guestReceiptPdfUrl(token: string): string | null {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/api/v1/public/bookings/view/${token}/receipt` : null;
}

export interface BookingEmailRow {
  label: string;
  value: string;
}

export function buildBookingEmailRows(booking: Booking): BookingEmailRow[] {
  return [
    { label: 'Reference', value: booking.reference },
    { label: 'Status', value: BOOKING_STATUS_LABELS[booking.status] ?? booking.status },
    { label: 'Passenger', value: booking.passengerName },
    { label: 'Phone', value: booking.passengerPhone },
    {
      label: 'Email',
      value: optionalText(booking.passengerEmail, 'Not provided'),
    },
    { label: 'Pickup', value: `${booking.pickupAddress}, ${booking.pickupPostcode}` },
    { label: 'Drop-off', value: `${booking.dropoffAddress}, ${booking.dropoffPostcode}` },
    { label: 'When', value: formatScheduledAt(booking.scheduledAt) },
    { label: 'Fare estimate', value: formatFare(booking.fareEstimatePence) },
    {
      label: 'Accessibility',
      value: formatAccessibility(booking.accessibilityRequirements),
    },
    { label: 'Notes', value: optionalText(booking.notes, 'None') },
  ];
}

export function buildOperatorBookingEmailRows(booking: Booking): BookingEmailRow[] {
  return [...buildBookingEmailRows(booking), { label: 'Source', value: booking.source }];
}

export function buildEmailTableHtml(rows: BookingEmailRow[]): string {
  return rows
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">${escapeHtml(row.label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');
}

export function buildEmailLayout(params: {
  operatorName: string;
  title: string;
  intro: string;
  rows: BookingEmailRow[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}): string {
  const rows = buildEmailTableHtml(params.rows);
  const primaryCta = params.primaryCta
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(params.primaryCta.href)}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;">${escapeHtml(params.primaryCta.label)}</a></p>`
    : '';
  const secondaryCta = params.secondaryCta
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(params.secondaryCta.href)}" style="color:#111827;text-decoration:underline;">${escapeHtml(params.secondaryCta.label)}</a></p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f9fafb;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">${escapeHtml(params.operatorName)}</p>
      <h1 style="margin:0 0 16px;font-size:24px;">${escapeHtml(params.title)}</h1>
      <p style="margin:0 0 24px;color:#374151;">${escapeHtml(params.intro)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
      ${primaryCta}
      ${secondaryCta}
    </div>
  </body>
</html>`;
}

export function buildEmailText(params: {
  operatorName: string;
  title: string;
  intro: string;
  rows: BookingEmailRow[];
  links?: string[];
}): string {
  const lines = [
    params.operatorName,
    params.title,
    '',
    params.intro,
    '',
    ...params.rows.map((row) => `${row.label}: ${row.value}`),
  ];

  if (params.links?.length) {
    lines.push('', ...params.links);
  }

  return lines.join('\n');
}
