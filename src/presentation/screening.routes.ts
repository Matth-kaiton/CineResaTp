import { Router } from "express";
import ScreeningService from "../business/ScreeningService";
import { apiResponse } from "../api/apiResponse";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const screenings = ScreeningService.getScreenings();

    return apiResponse.success(res, screenings);
  } catch (error) {
    next(error);
  }
});

export default router;
