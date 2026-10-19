// CinéResa — API de réservation de places de cinéma
// Version "historique" : tout est dans ce fichier. Ça marche… tant qu'on n'y touche pas.
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const DB_FILE = path.join(__dirname, "..", "data", "db.json");

function readDb(): any {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------------------------------------------------------------------------
// GET /screenings : liste des séances à venir avec le nombre de places restantes
// ---------------------------------------------------------------------------
app.get("/screenings", (req, res) => {
  const db = readDb();
  const now = new Date();
  const result = [];
  for (const s of db.screenings) {
    if (new Date(s.startsAt) < now) continue;
    let taken = 0;
    for (const b of db.bookings) {
      if (b.screeningId === s.id && b.status === "CONFIRMED") taken += b.seats;
    }
    result.push({
      id: s.id,
      movie: s.movie,
      room: s.room,
      startsAt: s.startsAt,
      price: s.price,
      remaining: s.capacity - taken,
    });
  }
  res.json(result);
});

// ---------------------------------------------------------------------------
// POST /screenings/:id/bookings : réserver des places
// body : { email, seats, tariff: "NORMAL" | "STUDENT" }
// ---------------------------------------------------------------------------
app.post("/screenings/:id/bookings", async (req, res) => {
  const db = readDb();
  const s = db.screenings.find((x: any) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Séance introuvable" });

  const email = req.body.email;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  const seats = Number(req.body.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 6) {
    return res
      .status(400)
      .json({ error: "Entre 1 et 6 places par réservation" });
  }

  if (new Date(s.startsAt) <= new Date()) {
    return res.status(409).json({ error: "La séance a déjà commencé" });
  }

  // calcul des places restantes (oui, c'est le même code que plus haut)
  let taken = 0;
  for (const b of db.bookings) {
    if (b.screeningId === s.id && b.status === "CONFIRMED") taken += b.seats;
  }
  if (taken + seats > s.capacity) {
    return res.status(409).json({ error: "Plus assez de places" });
  }

  // calcul du prix (en centimes)
  let unit = s.price;
  if (req.body.tariff === "STUDENT") unit = Math.round(unit * 0.7);
  let total = unit * seats;
  if (seats >= 4) total = Math.round(total * 0.9);

  // paiement : appel au prestataire (simulé)
  const paid = Math.random() > 0.05;
  if (!paid) return res.status(402).json({ error: "Paiement refusé" });

  const booking = {
    id: "b" + Date.now(),
    screeningId: s.id,
    email: email,
    seats: seats,
    tariff: req.body.tariff === "STUDENT" ? "STUDENT" : "NORMAL",
    total: total,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  writeDb(db);

  // envoi du mail de confirmation
  console.log(
    `[SMTP] To: ${email} — Votre réservation ${booking.id} pour "${s.movie}" ` +
      `(${seats} place(s), ${(total / 100).toFixed(2)} €) est confirmée.`,
  );

  res.status(201).json(booking);
});

// ---------------------------------------------------------------------------
// DELETE /bookings/:id : annuler (possible jusqu'à 2h avant la séance)
// ---------------------------------------------------------------------------
app.delete("/bookings/:id", (req, res) => {
  const db = readDb();
  const b = db.bookings.find((x: any) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: "Réservation introuvable" });
  if (b.status === "CANCELLED")
    return res.status(409).json({ error: "Déjà annulée" });

  const s = db.screenings.find((x: any) => x.id === b.screeningId);
  const diff = new Date(s.startsAt).getTime() - new Date().getTime();
  if (diff < 2 * 60 * 60 * 1000) {
    return res
      .status(409)
      .json({ error: "Annulation impossible moins de 2h avant la séance" });
  }

  b.status = "CANCELLED";
  b.cancelledAt = new Date().toISOString();
  writeDb(db);

  console.log(
    `[SMTP] To: ${b.email} — Votre réservation ${b.id} a été annulée. Remboursement : ${(b.total / 100).toFixed(2)} €`,
  );
  res.json(b);
});

// ---------------------------------------------------------------------------
// GET /bookings?email=... : mes réservations
// ---------------------------------------------------------------------------
app.get("/bookings", (req, res) => {
  const db = readDb();
  const list = db.bookings.filter((b: any) => b.email === req.query.email);
  res.json(
    list.map((b: any) => {
      const s = db.screenings.find((x: any) => x.id === b.screeningId);
      return {
        ...b,
        movie: s ? s.movie : "?",
        startsAt: s ? s.startsAt : null,
      };
    }),
  );
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`CinéResa legacy sur http://localhost:${PORT}`),
  );
}

export default app;
