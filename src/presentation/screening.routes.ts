import { Router } from "express";
import ScreeningService from "../business/ScreeningService";
import { apiResponse } from "../api/apiResponse";
import ErroResponse from "../types/errorResponse";
import BookingService from "../business/BookingService";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const screenings = await ScreeningService.getScreenings();

    return apiResponse.success(res, screenings);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/booking", async (req, res, next) => {
  try {
    const screeningId = req.params.id;
    const { email, seats, tarif } = req.body;

    const result = await BookingService.makeBooking(
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

export default router;
