import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import type { PublicBookingView } from '@uk-phv/shared-types';

import {
  BOOKING_STATUS_LABELS,
  formatAccessibility,
  formatFare,
  formatScheduledAt,
} from '@/lib/booking/display';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function drawLines(
  page: ReturnType<PDFDocument['addPage']>,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  lines: string[],
  startY: number,
  size: number,
  color = rgb(0.07, 0.09, 0.15),
): number {
  let y = startY;
  for (const line of lines) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size,
      font,
      color,
      maxWidth: CONTENT_WIDTH,
      lineHeight: size + 4,
    });
    y -= size + 14;
  }
  return y;
}

export async function generateBookingReceiptPdf(booking: PublicBookingView): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  page.drawText(booking.operatorName, {
    x: MARGIN,
    y,
    size: 20,
    font: bold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 28;

  page.drawText('Booking confirmation receipt', {
    x: MARGIN,
    y,
    size: 12,
    font: regular,
    color: rgb(0.42, 0.45, 0.5),
  });
  y -= 36;

  page.drawText(`Reference: ${booking.reference}`, {
    x: MARGIN,
    y,
    size: 14,
    font: bold,
    color: rgb(0.07, 0.09, 0.15),
  });
  y -= 22;

  page.drawText(`Status: ${BOOKING_STATUS_LABELS[booking.status] ?? booking.status}`, {
    x: MARGIN,
    y,
    size: 11,
    font: regular,
    color: rgb(0.22, 0.25, 0.32),
  });
  y -= 30;

  const rows: [string, string][] = [
    ['Passenger', booking.passengerName],
    ['Email', booking.passengerEmail],
    ['Pickup', `${booking.pickup.address}, ${booking.pickup.postcode}`],
    ['Drop-off', `${booking.dropoff.address}, ${booking.dropoff.postcode}`],
    [
      'When',
      booking.scheduledAt
        ? formatScheduledAt(new Date(booking.scheduledAt))
        : 'As soon as possible',
    ],
    ['Fare estimate', formatFare(booking.fareEstimatePence)],
    ['Accessibility', formatAccessibility(booking.accessibilityRequirements)],
    ['Notes', booking.notes?.trim() ? booking.notes.trim() : 'None'],
    [
      'Booked on',
      new Date(booking.createdAt).toLocaleString('en-GB', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/London',
      }),
    ],
  ];

  for (const [label, value] of rows) {
    page.drawText(label, {
      x: MARGIN,
      y,
      size: 10,
      font: bold,
      color: rgb(0.42, 0.45, 0.5),
    });
    y -= 14;
    y = drawLines(page, regular, [value], y, 11);
    y -= 8;
  }

  page.drawText(
    'This is your booking confirmation. Final fare may be confirmed by your operator before dispatch. Please quote your reference if you contact us.',
    {
      x: MARGIN,
      y: Math.max(MARGIN, y - 10),
      size: 9,
      font: regular,
      color: rgb(0.42, 0.45, 0.5),
      maxWidth: CONTENT_WIDTH,
      lineHeight: 12,
    },
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
