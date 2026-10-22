import { Router } from "express";
import { BookingService } from "../../../application/usecases/BookingService";
import { ScreeningService } from "../../../application/usecases/ScreeningService";
import { apiResponse } from "./apiResponse";
import { asyncHandler } from "./asyncHandler";

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
              ...b,
              movie: s ? s.movie : "?",
              startsAt: s ? s.startsAt : null,
            };
          }),
        );
        return apiResponse.success(res, enriched);
      }

      return apiResponse.success(res, bookings);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const bookingId = req.params.id;
      const result = await bookingService.cancelBooking(bookingId);

      return apiResponse.success(res, result);
    }),
  );

  return router;
};
