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

async function sendPassengerBookingEmail(params: {
  booking: Booking;
  operator: { tradingName: string | null; legalName: string };
  guestAccessToken: string;
  title: string;
  intro: string;
  subject: string;
}) {
  const { booking, operator, guestAccessToken, title, intro, subject } = params;
  const operatorName = operator.tradingName ?? operator.legalName;
  const tripUrl = guestTripUrl(guestAccessToken);
  const receiptUrl = guestReceiptPdfUrl(guestAccessToken);
  const rows = buildBookingEmailRows(booking);
  const view = buildPublicBookingView(booking, operator);
  const pdf = await generateBookingReceiptPdf(view);

  const html = buildEmailLayout({
    operatorName,
    title,
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
    title,
    intro,
    rows,
    links: links.length > 0 ? links : undefined,
  });

  await sendEmail({
    to: booking.passengerEmail ?? '',
    subject,
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

export async function sendBookingRequestReceivedToPassenger(
  booking: Booking,
  operator: { tradingName: string | null; legalName: string },
  guestAccessToken: string,
): Promise<void> {
  const { isConfigured } = getEmailConfig();
  const passengerEmail = booking.passengerEmail?.trim();
  if (!isConfigured || !passengerEmail) return;

  await sendPassengerBookingEmail({
    booking,
    operator,
    guestAccessToken,
    title: 'Booking request received',
    intro:
      'Thank you for your booking request. We have received it and our team will review and confirm availability shortly. Your PDF receipt is attached for reference.',
    subject: `Booking request received — ${booking.reference}`,
  });
}

export async function sendBookingConfirmedToPassenger(
  booking: Booking,
  operator: { tradingName: string | null; legalName: string },
  guestAccessToken: string,
): Promise<void> {
  const { isConfigured } = getEmailConfig();
  const passengerEmail = booking.passengerEmail?.trim();
  if (!isConfigured || !passengerEmail) return;

  await sendPassengerBookingEmail({
    booking,
    operator,
    guestAccessToken,
    title: 'Your booking is confirmed',
    intro:
      'Your booking has now been confirmed by our dispatch team. We will keep this trip updated as your driver is assigned and the journey progresses.',
    subject: `Booking confirmed — ${booking.reference}`,
  });
}
