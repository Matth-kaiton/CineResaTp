import { Screening } from "../../../domain/types/Screening";
import { ScreeningRepository } from "../../../application/ports/out/ScreeningRepository";
import { JsonFile, ScreeningRecord } from "./JsonFile";

export default class JsonScreeningRepository implements ScreeningRepository {
  constructor(private readonly file: JsonFile) {}

  async listUpcomingScreenings(): Promise<Screening[]> {
    const data = this.file.read();
    const now = new Date();
    return data.screenings
      .filter((s) => new Date(s.startsAt) >= now)
      .map((s) => this.toDomain(s));
  }

  async getById(id: string): Promise<Screening | null> {
    const data = this.file.read();
    const record = data.screenings.find((s) => s.id === id);
    if (!record) return null;
    return this.toDomain(record);
  }

  async countRemainingSeats(screening: Screening): Promise<number> {
    const data = this.file.read();
    const totalTaken = data.bookings
      .filter((b) => b.screeningId === screening.id && b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.seats, 0);

    return screening.capacity - totalTaken;
  }

  private toDomain(record: ScreeningRecord): Screening {
    return {
      id: record.id,
      movie: record.movie,
      room: record.room,
      startsAt: new Date(record.startsAt),
      capacity: record.capacity,
      price: record.price,
    };
  }
}
