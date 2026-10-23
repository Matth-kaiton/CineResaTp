import { Router } from "express";
import Booking from "../../../domain/booking/Booking";
import { BookingService } from "../../../application/usecases/BookingService";
import { ScreeningService } from "../../../application/usecases/ScreeningService";
import { apiResponse } from "./apiResponse";
import { asyncHandler } from "./asyncHandler";

const bookingResponse = (booking: Booking) => ({
  id: booking.id,
  screeningId: booking.screeningId,
  email: booking.email.value,
  seats: booking.seats.value,
  tariff: booking.tariff,
  total: booking.total.cents,
  status: booking.getStatus(),
  createdAt: booking.createdAt,
  cancelledAt: booking.getCancelledAt(),
});

export const bookingRouter = (
  bookingService: BookingService,
  screeningService?: ScreeningService,
) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const email = (req.query.email as string) || null;
      const bookings = await bookingService.listMyBookings(email);

      if (screeningService) {
        const enriched = await Promise.all(
          bookings.map(async (b) => {
            const s = await screeningService.getScreeningById(b.screeningId);
            return {
              ...bookingResponse(b),
              movie: s ? s.movie : "?",
              startsAt: s ? s.startsAt : null,
            };
          }),
        );
        return apiResponse.success(res, enriched);
      }

      return apiResponse.success(res, bookings.map(bookingResponse));
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const bookingId = req.params.id;
      const result = await bookingService.cancelBooking(bookingId);

      return apiResponse.success(res, bookingResponse(result));
    }),
  );

  return router;
};
