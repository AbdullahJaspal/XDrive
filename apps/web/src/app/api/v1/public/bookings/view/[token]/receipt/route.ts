import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/api/response';
import { generateBookingReceiptPdf } from '@/lib/server/services/booking-receipt-pdf';
import { bookingsService } from '@/lib/server/services/bookings.service';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const booking = await bookingsService.findPublicViewByToken(token);
    const pdf = await generateBookingReceiptPdf(booking);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="booking-${booking.reference}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
