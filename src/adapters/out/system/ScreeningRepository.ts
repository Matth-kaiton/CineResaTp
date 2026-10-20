import { readDb } from "./dbService";
import { Screening } from "../../../domain/Screening";
import { Booking } from "../../../domain/Booking";
import { ScreeningRepositoryPort } from "../../../application/ports/out/ScreeningRepositoryPort";

class ScreeningRepository implements ScreeningRepositoryPort {
  constructor() {}
  private db = readDb();

  async getScreenings() {
    const now = new Date();
    const result = [];

    for (const s of this.db.screenings) {
      if (new Date(s.startsAt) < now) continue;

      result.push(s);
    }

    return result;
  }

  async getById(id: string): Promise<Screening> {
    const screening = this.db.screenings.find((s: Screening) => s.id === id);
    return screening;
  }

  async countRemainingSeats(screening: Screening) {
    const NO_SEAT_TAKEN = 0;

    const totalTakenSeats = await this.db.bookings
      .filter((b: Booking) => b.screeningId === screening.id)
      .reduce((sum: number, b: Booking) => sum + b.seats, NO_SEAT_TAKEN);

    return screening.capacity - totalTakenSeats;
  }
}

export default new ScreeningRepository();
