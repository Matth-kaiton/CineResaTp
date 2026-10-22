import express from "express";
import { screeningRouter } from "./adapters/in/http/screening.routes";
import { bookingRouter } from "./adapters/in/http/booking.routes";
import { errorHandler } from "./adapters/in/http/errorHandler";
import { ScreeningService } from "./application/usecases/ScreeningService";
import { BookingService } from "./application/usecases/BookingService";
import ScreeningRepository from "./adapters/out/system/ScreeningRepository";
import BookingRepository from "./adapters/out/system/BookingRepository";
import Mailer from "./adapters/out/notification/mailer";
import Payment from "./adapters/out/payment/payment";

const app = express();
app.use(express.json());

const screeningService = new ScreeningService(ScreeningRepository);
const bookingService = new BookingService(
  screeningService,
  ScreeningRepository,
  BookingRepository,
  Mailer,
  Payment,
);

app.use("/screenings", screeningRouter(screeningService, bookingService));

app.use("/bookings", bookingRouter(bookingService));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`CinéResa legacy sur http://localhost:${PORT}`),
  );
}

app.use(errorHandler);

export default app;
