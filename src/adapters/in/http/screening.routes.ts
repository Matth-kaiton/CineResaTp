import { Router } from "express";
import { ScreeningService } from "../../../application/usecases/ScreeningService";
import { BookingService } from "../../../application/usecases/BookingService";
import { apiResponse } from "./apiResponse";
import { asyncHandler } from "./asyncHandler";

export const screeningRouter = (
  screeningService: ScreeningService,
  bookingService: BookingService,
) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const screenings = await screeningService.listUpcomingScreenings();
      return apiResponse.success(
        res,
        screenings.map((screening) => ({
          id: screening.id,
          movie: screening.movie,
          room: screening.room,
          startsAt: screening.startsAt,
          capacity: screening.capacity,
          price: screening.price.cents,
          remaining: screening.remainingSeats(),
        })),
      );
    }),
  );

  router.post(
    "/:id/bookings",
    asyncHandler(async (req, res) => {
      const screeningId = req.params.id;
      const { email, seats, tarif } = req.body;

      const result = await bookingService.makeBooking(
        screeningId,
        email,
        seats,
        tarif,
      );

      return apiResponse.create(res, {
        id: result.id,
        screeningId: result.screeningId,
        email: result.email.value,
        seats: result.seats.value,
        tariff: result.tariff,
        total: result.total.cents,
        status: result.getStatus(),
        createdAt: result.createdAt,
        cancelledAt: result.getCancelledAt(),
      });
    }),
  );

  return router;
};
