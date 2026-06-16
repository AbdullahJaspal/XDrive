import PDFDocument from 'pdfkit';

import type { PublicBookingView } from '@uk-phv/shared-types';

import {
  BOOKING_STATUS_LABELS,
  formatAccessibility,
  formatFare,
  formatScheduledAt,
} from '@/lib/booking/display';

function addRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string): void {
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text(label);
  doc.moveDown(0.15);
  doc.font('Helvetica').fontSize(11).fillColor('#111827').text(value);
  doc.moveDown(0.75);
}

export function generateBookingReceiptPdf(booking: PublicBookingView): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#111827').text(booking.operatorName);
    doc.moveDown(0.25);
    doc.font('Helvetica').fontSize(12).fillColor('#6b7280').text('Booking confirmation receipt');
    doc.moveDown(1.25);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#111827')
      .text(`Reference: ${booking.reference}`);
    doc.moveDown(0.5);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text(`Status: ${BOOKING_STATUS_LABELS[booking.status] ?? booking.status}`);
    doc.moveDown(1.25);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    addRow(doc, 'Passenger', booking.passengerName);
    addRow(doc, 'Email', booking.passengerEmail);
    addRow(doc, 'Pickup', `${booking.pickup.address}, ${booking.pickup.postcode}`);
    addRow(doc, 'Drop-off', `${booking.dropoff.address}, ${booking.dropoff.postcode}`);
    addRow(
      doc,
      'When',
      booking.scheduledAt
        ? formatScheduledAt(new Date(booking.scheduledAt))
        : 'As soon as possible',
    );
    addRow(doc, 'Fare estimate', formatFare(booking.fareEstimatePence));
    addRow(doc, 'Accessibility', formatAccessibility(booking.accessibilityRequirements));
    addRow(doc, 'Notes', booking.notes?.trim() ? booking.notes.trim() : 'None');
    addRow(
      doc,
      'Booked on',
      new Date(booking.createdAt).toLocaleString('en-GB', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/London',
      }),
    );

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(0.75);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6b7280')
      .text(
        'This is your booking confirmation. Final fare may be confirmed by your operator before dispatch. Please quote your reference if you contact us.',
        { align: 'left' },
      );

    doc.end();
  });
}
