-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guest_access_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_guest_access_token_key" ON "bookings"("guest_access_token");
