-- One live booking per service time slot. Partial unique index so that
-- canceled bookings don't block re-booking the released slot. This makes the
-- second concurrent insert fail at the DB (caught as P2002), closing the
-- check-then-create race in createBooking().
CREATE UNIQUE INDEX "Booking_serviceId_startUtc_active_key"
  ON "Booking" ("serviceId", "startUtc")
  WHERE "status" IN ('pending', 'confirmed');
