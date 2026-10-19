// CinéResa — API de réservation de places de cinéma
// Version "historique" : tout est dans ce fichier. Ça marche… tant qu'on n'y touche pas.
import express from "express";
import screeningRoutes from "./presentation/screening.routes";
import bookingRoutes from "./presentation/booking.routes";
import sendMail from "./data/mailer.js";
import { errorHandler } from "./types/errorHandler";

const app = express();
app.use(express.json());

app.use("/screenings", screeningRoutes);

app.use("/bookings", bookingRoutes);

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
