// CinéResa — API de réservation de places de cinéma
// Version "historique" : tout est dans ce fichier. Ça marche… tant qu'on n'y touche pas.
import express from "express";
import { screeningRouter } from "./adapters/in/http/screening.routes";
import { bookingRouter } from "./adapters/in/http/booking.routes";
import { errorHandler } from "./adapters/in/http/errorHandler";
import { ScreeningService } from "./application/usecases/ScreeningService";
import ScreeningRepository from "./adapters/out/system/ScreeningRepository";
import BookingRepository from "./adapters/out/system/BookingRepository";
import { BookingService } from "./application/usecases/BookingService";
import Mailer from "./adapters/out/notification/mailer";

const app = express();
app.use(express.json());

const screeningService = new ScreeningService(ScreeningRepository);
const bookingService = new BookingService(
  screeningService,
  ScreeningRepository,
  BookingRepository,
  new Mailer
);

app.use("/screenings", screeningRouter(screeningService, bookingService));

app.use("/bookings", bookingRouter(bookingService));

// ---------------------------------------------------------------------------
// DELETE /bookings/:id : annuler (possible jusqu'à 2h avant la séance)
// ---------------------------------------------------------------------------
// app.delete("/bookings/:id", (req, res) => {
//   const db = readDb();
//   const b = db.bookings.find((x: any) => x.id === req.params.id);
//   if (!b) return res.status(404).json({ error: "Réservation introuvable" });
//   if (b.status === "CANCELLED")
//     return res.status(409).json({ error: "Déjà annulée" });

//   const s = db.screenings.find((x: any) => x.id === b.screeningId);
//   const diff = new Date(s.startsAt).getTime() - new Date().getTime();
//   if (diff < 2 * 60 * 60 * 1000) {
//     return res
//       .status(409)
//       .json({ error: "Annulation impossible moins de 2h avant la séance" });
//   }

//   b.status = "CANCELLED";
//   b.cancelledAt = new Date().toISOString();
//   writeDb(db);

//   sendMail(
//     b.email,
//     `Votre réservation ${b.id} a été annulée. Remboursement : ${(b.total / 100).toFixed(2)} €`,
//   );
//   res.json(b);
// });

// ---------------------------------------------------------------------------
// GET /bookings?email=... : mes réservations
// ---------------------------------------------------------------------------
// app.get("/bookings", (req, res) => {
//   const db = readDb();
//   const list = db.bookings.filter((b: any) => b.email === req.query.email);
//   res.json(
//     list.map((b: any) => {
//       const s = db.screenings.find((x: any) => x.id === b.screeningId);
//       return {
//         ...b,
//         movie: s ? s.movie : "?",
//         startsAt: s ? s.startsAt : null,
//       };
//     }),
//   );
// });

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`CinéResa legacy sur http://localhost:${PORT}`),
  );
}

app.use(errorHandler);

export default app;
