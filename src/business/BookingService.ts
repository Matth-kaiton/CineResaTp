import { Booking } from "../types/Booking";
import BookingRepository from "../data/BookingRepositiry";

class BookingService {
  private bookingRepo = BookingRepository;

  async makeBooking(screeningId: string, email: string, seats: number) {
    // const s = db.screenings.find((x: any) => x.id === req.params.id);
    // if (!s) return res.status(404).json({ error: "Séance introuvable" });
    // if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    //   return res.status(400).json({ error: "Email invalide" });
    // }
    // if (!Number.isInteger(seats) || seats < 1 || seats > 6) {
    //   return res
    //     .status(400)
    //     .json({ error: "Entre 1 et 6 places par réservation" });
    // }
    // if (new Date(s.startsAt) <= new Date()) {
    //   return res.status(409).json({ error: "La séance a déjà commencé" });
    // }
    // // calcul des places restantes (oui, c'est le même code que plus haut)
    // let taken = 0;
    // for (const b of db.bookings) {
    //   if (b.screeningId === s.id && b.status === "CONFIRMED") taken += b.seats;
    // }
    // if (taken + seats > s.capacity) {
    //   return res.status(409).json({ error: "Plus assez de places" });
    // }
    // // calcul du prix (en centimes)
    // let unit = s.price;
    // if (req.body.tariff === "STUDENT") unit = Math.round(unit * 0.7);
    // let total = unit * seats;
    // if (seats >= 4) total = Math.round(total * 0.9);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const booking: Booking | null = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    this.bookingRepo.deleteBooking(booking);
  }

  async myBookings(email: string): Promise<Booking[]> {
    return this.bookingRepo.fectBookingForUser(email);
  }
}

export default new BookingService();
