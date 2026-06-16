import type { Booking } from '@prisma/client';

import { getEmailConfig } from '../config';
import {
  buildEmailLayout,
  buildEmailText,
  buildOperatorBookingEmailRows,
  getSiteUrl,
  optionalText,
} from './booking-email-shared';
import { sendEmail } from '../services/email.service';

export async function sendBookingCreatedNotification(
  booking: Booking,
  operator: { contactEmail: string; tradingName: string | null; legalName: string },
): Promise<void> {
  const { notificationTo, isConfigured } = getEmailConfig();
  if (!isConfigured) return;

  const to = notificationTo ?? operator.contactEmail;
  const operatorName = operator.tradingName ?? operator.legalName;
  const siteUrl = getSiteUrl();
  const dashboardLink = siteUrl ? `${siteUrl}/dashboard` : null;
  const rows = buildOperatorBookingEmailRows(booking);

  const html = buildEmailLayout({
    operatorName,
    title: 'New booking request',
    intro: 'A new booking has been submitted and is waiting in dispatch.',
    rows,
    primaryCta: dashboardLink
      ? { label: 'Open dispatch dashboard', href: dashboardLink }
      : undefined,
  });

  const text = buildEmailText({
    operatorName,
    title: 'New booking request',
    intro: 'A new booking has been submitted and is waiting in dispatch.',
    rows,
    links: dashboardLink ? [`Open dispatch dashboard: ${dashboardLink}`] : undefined,
  });

  await sendEmail({
    to,
    subject: `New booking ${booking.reference}`,
    html,
    text,
    replyTo: optionalText(booking.passengerEmail, '') || undefined,
  });
}
