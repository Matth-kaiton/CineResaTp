import express, { Router, Request, Response } from 'express'
import ScreeningService from "../business/ScreeningService";
import { apiResponse } from "../api/apiResponse";
import BookingService from "../business/BookingService"
import ErroResponse from '../types/errorResponse'

const router = express.Router();

router.post("/" ,async (req, res, next)=>{
    try{
        const screeningId = req.params.id;
        const { email, seats, tarif } = req.body;

        const result = BookingService.makeBooking()

        return apiResponse.create(res,result);
    } catch (err: ErroResponse) {
    apiResponse.error(res,err.message, err.statusCode)
  }
});


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

  const paid = pay(total);
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
  sendMail(
    email,
    `Votre réservation ${booking.id} pour "${s.movie}" (${seats} place(s), ${(total / 100).toFixed(2)} €) est confirmée.`,
  );

  res.status(201).json(booking);
});

export default router;
