import express, { Express } from "express";
import { ScreeningRepository } from "./application/ports/out/ScreeningRepository";
import { BookingRepository } from "./application/ports/out/BookingRepository";
import { PaymentPort } from "./application/ports/out/PaymentPort";
import { NotifyPort } from "./application/ports/out/NotifyPort";
import { ScreeningService } from "./application/usecases/ScreeningService";
import { BookingService } from "./application/usecases/BookingService";
import { screeningRouter } from "./adapters/in/http/screening.routes";
import { bookingRouter } from "./adapters/in/http/booking.routes";
import { errorHandler } from "./adapters/in/http/errorHandler";

export interface Adapters {
  screenings: ScreeningRepository;
  bookings: BookingRepository;
  payment: PaymentPort;
  notifier: NotifyPort;
  clock?: { now: () => Date };
}

export function buildApp(adapters: Adapters): Express {
  const app = express();
  app.use(express.json());

  const screeningService = new ScreeningService(adapters.screenings);
  const bookingService = new BookingService(
    screeningService,
    adapters.screenings,
    adapters.bookings,
    adapters.notifier,
    adapters.payment,
    adapters.clock,
  );

  app.use(
    "/screenings",
    screeningRouter(screeningService, bookingService, adapters.screenings),
  );
  app.use("/bookings", bookingRouter(bookingService, screeningService));

  app.use(errorHandler);

  return app;
}
