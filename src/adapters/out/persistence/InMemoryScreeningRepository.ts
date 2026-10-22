import { ScreeningRepository } from "../../../application/ports/out/ScreeningRepository";
import { Screening } from "../../../domain/types/Screening";
import { BookingRepository } from "../../../application/ports/out/BookingRepository";

export default class InMemoryScreeningRepository implements ScreeningRepository {
  constructor(private screenings: Screening[], private bookingRepository: BookingRepository) {}

  async listUpcomingScreenings(): Promise<Screening[]> {
    return this.screenings;
  }

  async getById(id: string): Promise<Screening | null> {
    const screening = this.screenings.find((s) => s.id === id);
    return screening || null;
  }

  async countRemainingSeats(screening: Screening): Promise<number> {
    const totalSeats = screening.capacity || 0;
    const bookedSeats = await this.bookingRepository.countConfirmedSeats(screening.id);
    return totalSeats - bookedSeats;
  }
}
