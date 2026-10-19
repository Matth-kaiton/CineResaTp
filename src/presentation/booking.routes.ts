import { Router } from "express";
import { apiResponse } from "../api/apiResponse";
import BookingService from "../business/BookingService";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const email = req.query.email as string | null;

    const bookings = await BookingService.myBookings(email);

    return apiResponse.success(res, bookings);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    const result = await BookingService.cancelBooking(bookingId);

    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
