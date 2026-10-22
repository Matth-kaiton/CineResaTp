import { readDb, writeDb } from "./dbService";
import { Booking } from "../../../domain/types/Booking";
import { BookingRepositoryPort } from "../../../application/ports/out/BookingRepositoryPort";

class BookingRepository implements BookingRepositoryPort {
  private db = readDb();

  async getAllByMail(mail: string) {
    const result = this.db.bookings.filter((b: Booking) => b.email === mail);
    return result;
  }

  async create(booking: Booking) {
    await this.db.bookings.push(booking);
    writeDb(this.db);
    return booking;
  }

  async update(booking: Booking) {
    const index = this.db.bookings.findIndex(
      (b: Booking) => b.id === booking.id,
    );

    this.db.bookings[index] = booking;
    writeDb(this.db);
    return booking;
  }

  async getById(id: string) {
    const b = this.db.bookings.find((x: any) => x.id === id);
    if (!b) return null;
    return b;
  }
}

export default new BookingRepository();
