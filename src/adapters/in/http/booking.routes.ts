import { Router } from "express";
import { apiResponse } from "./apiResponse";
import { BookingService } from "../../../application/usecases/BookingService";
import { ScreeningService } from "../../../application/usecases/ScreeningService";

export const bookingRouter = (bookingService: BookingService) => {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const email = req.query.email as string | null;

      const bookings = await bookingService.myBookings(email);

      return apiResponse.success(res, bookings);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const bookingId = req.params.id;

      const result = await bookingService.cancelBooking(bookingId);

      return apiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
