import { Router } from "express";
import { ScreeningService } from "../../../application/usecases/ScreeningService";
import { BookingService } from "../../../application/usecases/BookingService";
import { ScreeningRepository } from "../../../application/ports/out/ScreeningRepository";
import { apiResponse } from "./apiResponse";
import { asyncHandler } from "./asyncHandler";

export const screeningRouter = (
  screeningService: ScreeningService,
  bookingService: BookingService,
  screeningRepo?: ScreeningRepository,
) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const screenings = await screeningService.listUpcomingScreenings();
      if (screeningRepo) {
        const withRemaining = await Promise.all(
          screenings.map(async (s) => ({
            ...s,
            remaining: await screeningRepo.countRemainingSeats(s),
          })),
        );
        return apiResponse.success(res, withRemaining);
      }
      return apiResponse.success(res, screenings);
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

      return apiResponse.create(res, result);
    }),
  );

  return router;
};
