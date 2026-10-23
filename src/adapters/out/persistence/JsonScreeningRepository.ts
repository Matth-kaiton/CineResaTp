import Screening from "../../../domain/booking/Screening";
import { ScreeningRepository } from "../../../application/ports/out/ScreeningRepository";
import { JsonFile, ScreeningRecord } from "./JsonFile";
import JsonBookingRepository from "./JsonBookingRepository";

export default class JsonScreeningRepository implements ScreeningRepository {
  private readonly bookingRepository: JsonBookingRepository;

  constructor(private readonly file: JsonFile) {
    this.bookingRepository = new JsonBookingRepository(file);
  }

  async listUpcomingScreenings(): Promise<Screening[]> {
    const data = this.file.read();
    const now = new Date();
    const upcoming = data.screenings
      .filter((s) => new Date(s.startsAt) >= now)
      .map((s) => this.toDomain(s));
    return Promise.all(upcoming);
  }

  async getById(id: string): Promise<Screening | null> {
    const data = this.file.read();
    const record = data.screenings.find((s) => s.id === id);
    if (!record) return null;
    return this.toDomain(record);
  }

  private async toDomain(record: ScreeningRecord): Promise<Screening> {
    const bookings = await this.bookingRepository.findByScreeningId(record.id);
    return Screening.fromSnapshot({
      id: record.id,
      movie: record.movie,
      room: record.room,
      startsAt: record.startsAt,
      capacity: record.capacity,
      priceCents: record.price,
      bookings: bookings.map((booking) => booking.toSnapshot()),
    });
  }
}
