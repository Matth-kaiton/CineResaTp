import { buildApp } from "./container";
import InMemoryScreeningRepository from "./adapters/out/persistence/InMemoryScreeningRepository";
import InMemoryBookingRepository from "./adapters/out/persistence/InMemoryBookingRepository";
import Mailer from "./adapters/out/notification/mailer";
import Payment from "./adapters/out/payment/payment";

const bookingRepo = new InMemoryBookingRepository();
const screeningRepo = new InMemoryScreeningRepository([], bookingRepo);

const app = buildApp({
  screenings: screeningRepo,
  bookings: bookingRepo,
  payment: Payment,
  notifier: Mailer,
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`CinéResa sur http://localhost:${PORT}`));
}

export default app;
