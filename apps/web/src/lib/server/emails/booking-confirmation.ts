import type { Booking } from '@prisma/client';

import { getEmailConfig } from '../config';
import {
  buildBookingEmailRows,
  buildEmailLayout,
  buildEmailText,
  guestReceiptPdfUrl,
  guestTripUrl,
} from './booking-email-shared';
import { generateBookingReceiptPdf } from '../services/booking-receipt-pdf';
import { buildPublicBookingView } from '../booking-public-view';
import { sendEmail } from '../services/email.service';

export async function sendBookingConfirmationToPassenger(
  booking: Booking,
  operator: { tradingName: string | null; legalName: string },
  guestAccessToken: string,
): Promise<void> {
  const { isConfigured } = getEmailConfig();
  const passengerEmail = booking.passengerEmail?.trim();
  if (!isConfigured || !passengerEmail) return;

  const operatorName = operator.tradingName ?? operator.legalName;
  const tripUrl = guestTripUrl(guestAccessToken);
  const receiptUrl = guestReceiptPdfUrl(guestAccessToken);
  const rows = buildBookingEmailRows(booking);
  const view = buildPublicBookingView(booking, operator);
  const pdf = await generateBookingReceiptPdf(view);

  const intro =
    'Thank you for booking with us. Your request has been received and our team will confirm your fare before dispatch. Your PDF receipt is attached to this email.';

  const html = buildEmailLayout({
    operatorName,
    title: 'Your booking is confirmed',
    intro,
    rows,
    primaryCta: tripUrl ? { label: 'View booking details', href: tripUrl } : undefined,
    secondaryCta: receiptUrl ? { label: 'Download PDF receipt', href: receiptUrl } : undefined,
  });

  const links: string[] = [];
  if (tripUrl) links.push(`View booking details: ${tripUrl}`);
  if (receiptUrl) links.push(`Download PDF receipt: ${receiptUrl}`);

  const text = buildEmailText({
    operatorName,
    title: 'Your booking is confirmed',
    intro,
    rows,
    links: links.length > 0 ? links : undefined,
  });

  await sendEmail({
    to: passengerEmail,
    subject: `Booking confirmed — ${booking.reference}`,
    html,
    text,
    attachments: [
      {
        filename: `booking-${booking.reference}.pdf`,
        content: pdf,
      },
    ],
  });
}
