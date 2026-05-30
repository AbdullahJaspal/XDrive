import { prisma } from '../db';
import { AppError } from '../errors/app.error';

export const paymentsService = {
  async createPending(bookingId: string, amountPence: number) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw AppError.notFound('Booking', bookingId);

    return prisma.payment.create({
      data: {
        bookingId,
        amountPence,
        currency: 'gbp',
        status: 'PENDING',
      },
    });
  },
};
