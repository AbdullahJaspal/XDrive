import type { Booking } from '@prisma/client';

import { getEmailConfig } from '../config';
import { sendEmail } from '../services/email.service';

const ACCESSIBILITY_LABELS: Record<string, string> = {
  WHEELCHAIR_ACCESSIBLE: 'Wheelchair accessible',
  ASSISTANCE_DOG: 'Assistance dog',
  HEARING_LOOP: 'Hearing loop',
  STEP_FREE: 'Step-free access',
  LARGE_PRINT_RECEIPT: 'Large print receipt',
  OTHER: 'Other requirements',
};

function formatScheduledAt(value: Date | null): string {
  if (!value) return 'As soon as possible';
  return value.toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  });
}

function formatFare(pence: number | null): string {
  if (pence == null) return 'Not estimated';
  return `£${(pence / 100).toFixed(2)}`;
}

function formatAccessibility(requirements: unknown): string {
  if (!Array.isArray(requirements) || requirements.length === 0) return 'None';
  return requirements.map((item) => ACCESSIBILITY_LABELS[String(item)] ?? String(item)).join(', ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function optionalText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed;
}

function optionalReplyTo(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function buildBookingRows(booking: Booking): { label: string; value: string }[] {
  return [
    { label: 'Reference', value: booking.reference },
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
    { label: 'Source', value: booking.source },
  ];
}

function buildHtml(booking: Booking, operatorName: string, dashboardLink: string | null): string {
  const rows = buildBookingRows(booking)
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">${escapeHtml(row.label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');

  const dashboardButton = dashboardLink
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(dashboardLink)}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;">Open dispatch dashboard</a></p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f9fafb;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">${escapeHtml(operatorName)}</p>
      <h1 style="margin:0 0 16px;font-size:24px;">New booking request</h1>
      <p style="margin:0 0 24px;color:#374151;">A new booking has been submitted and is waiting in dispatch.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
      ${dashboardButton}
    </div>
  </body>
</html>`;
}

function buildText(booking: Booking, operatorName: string, dashboardLink: string | null): string {
  const lines = [
    operatorName,
    'New booking request',
    '',
    ...buildBookingRows(booking).map((row) => `${row.label}: ${row.value}`),
  ];

  if (dashboardLink) {
    lines.push('', `Open dispatch dashboard: ${dashboardLink}`);
  }

  return lines.join('\n');
}

export async function sendBookingCreatedNotification(
  booking: Booking,
  operator: { contactEmail: string; tradingName: string | null; legalName: string },
): Promise<void> {
  const { notificationTo, isConfigured } = getEmailConfig();
  if (!isConfigured) return;

  const to = notificationTo ?? operator.contactEmail;
  const operatorName = operator.tradingName ?? operator.legalName;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const dashboardLink = siteUrl ? `${siteUrl}/dashboard` : null;

  await sendEmail({
    to,
    subject: `New booking ${booking.reference}`,
    html: buildHtml(booking, operatorName, dashboardLink),
    text: buildText(booking, operatorName, dashboardLink),
    replyTo: optionalReplyTo(booking.passengerEmail),
  });
}
