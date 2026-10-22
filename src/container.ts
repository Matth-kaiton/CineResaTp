import express, { Express } from "express";
import path from "path";
import { ScreeningRepository } from "./application/ports/out/ScreeningRepository";
import { BookingRepository } from "./application/ports/out/BookingRepository";
import { PaymentPort } from "./application/ports/out/PaymentPort";
import { NotifyPort } from "./application/ports/out/NotifyPort";
import { ScreeningService } from "./application/usecases/ScreeningService";
import { BookingService } from "./application/usecases/BookingService";
import { screeningRouter } from "./adapters/in/http/screening.routes";
import { bookingRouter } from "./adapters/in/http/booking.routes";
import { errorHandler } from "./adapters/in/http/errorHandler";
import InMemoryScreeningRepository from "./adapters/out/persistence/InMemoryScreeningRepository";
import InMemoryBookingRepository from "./adapters/out/persistence/InMemoryBookingRepository";
import JsonScreeningRepository from "./adapters/out/persistence/JsonScreeningRepository";
import JsonBookingRepository from "./adapters/out/persistence/JsonBookingRepository";
import { JsonFile } from "./adapters/out/persistence/JsonFile";
import Mailer from "./adapters/out/notification/mailer";
import Payment from "./adapters/out/payment/payment";

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

export function createAdapters(options: { json?: boolean } = {}): Adapters {
  const isJson =
    options.json ??
    (process.argv.includes("--json") || process.env.STORAGE === "json");

  if (isJson) {
    const dbPath = path.resolve(process.cwd(), "data/db.json");
    const jsonFile = new JsonFile(dbPath);
    return {
      screenings: new JsonScreeningRepository(jsonFile),
      bookings: new JsonBookingRepository(jsonFile),
      payment: Payment,
      notifier: Mailer,
    };
  }

  const bookingRepo = new InMemoryBookingRepository();
  const screeningRepo = new InMemoryScreeningRepository([], bookingRepo);
  return {
    screenings: screeningRepo,
    bookings: bookingRepo,
    payment: Payment,
    notifier: Mailer,
  };
}
