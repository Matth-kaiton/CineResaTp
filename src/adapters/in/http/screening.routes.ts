import { Router } from "express";
import { ScreeningService } from "../../../application/usecases/ScreeningService";
import { apiResponse } from "./apiResponse";
import { BookingService } from "../../../application/usecases/BookingService";

export const screeningRouter = (
  screeningService: ScreeningService,
  bookingService: BookingService,
) => {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const screenings = await screeningService.getScreenings();

      return apiResponse.success(res, screenings);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/booking", async (req, res, next) => {
    try {
      const screeningId = req.params.id;
      const { email, seats, tarif } = req.body;

      const result = await bookingService.makeBooking(
        screeningId,
        email,
        seats,
        tarif,
      );

      return apiResponse.create(res, result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
