import { readDb, writeDb } from "./dbService";
import { Screening } from "../types/Screening";
import { Booking } from "../types/Booking";

class ScreeningRepository {
  private db = readDb();

  async fectAllScreening() {
    const now = new Date();
    const result = [];

    for (const s of this.db.screenings) {
      if (new Date(s.startsAt) < now) continue;

      result.push(s);
    }

    return result;
  }

  async countRemainingSeats(screening: Screening) {
    const NO_SEAT_TAKEN = 0;

    const totalTakenSeats = this.db.bookings
      .filter((b: Booking) => b.screeningId === screening.id)
      .reduce((sum: number, b: Booking) => sum + b.seats, NO_SEAT_TAKEN);

    return screening.capacity - totalTakenSeats;
  }
}

export default new ScreeningRepository();
