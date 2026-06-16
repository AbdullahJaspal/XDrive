import type { Booking } from '@prisma/client';

import { getEmailConfig } from '../config';
import {
  buildBookingEmailRows,
  buildEmailLayout,
  buildEmailText,
  guestReceiptPdfUrl,
  guestTripUrl,
} from './booking-email-shared';
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

  const html = buildEmailLayout({
    operatorName,
    title: 'Your booking is confirmed',
    intro:
      'Thank you for booking with us. Your request has been received and our team will confirm your fare before dispatch. Keep this email for your records.',
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
    intro:
      'Thank you for booking with us. Your request has been received and our team will confirm your fare before dispatch.',
    rows,
    links: links.length > 0 ? links : undefined,
  });

  await sendEmail({
    to: passengerEmail,
    subject: `Booking confirmed — ${booking.reference}`,
    html,
    text,
    replyTo: undefined,
  });
}
