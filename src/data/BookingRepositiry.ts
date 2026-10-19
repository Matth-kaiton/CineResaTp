import { readDb, writeDb } from "./dbService";
import { UserStatus } from "../enum/UserStatuts";
import { BookingStatus } from "../enum/BookingStatus";
import { Booking } from "../types/Booking";

class BookingRepository {
  private db = readDb();

  async fectBookingForUser(mail: string) {
    const list = this.db.bookings.filter((b: Booking) => b.email === mail);
  }

  async createBooking(
    screeningId: string,
    email: string,
    seats: number,
    tarif: UserStatus = UserStatus.NORMAL,
    total: number,
  ) {
    const booking = {
      id: "b" + Date.now(),
      screeningId: screeningId,
      email: email,
      seats: seats,
      tariff: tarif,
      total: total,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString(),
    };
    this.db.bookings.push(booking);
    writeDb(this.db);
  }

  async deleteBooking(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    writeDb(this.db);
  }

  async findById(id: string) {
    const b = this.db.bookings.find((x: any) => x.id === id);
    if (!b) return null;
    return b;
  }
}

export default new BookingRepository();
