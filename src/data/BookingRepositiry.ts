import { readDb, writeDb } from "./dbService";
import { UserStatus } from "../enum/UserStatuts";
import { BookingStatus } from "../enum/BookingStatus";
import { Booking } from "../types/Booking";

class BookingRepository {
  private db = readDb();

  async fectBookingForUser(mail: string) {
    const result = this.db.bookings.filter((b: Booking) => b.email === mail);
    return result;
  }

  async createBooking(booking: Booking) {
    await this.db.bookings.push(booking);
    writeDb(this.db);
    return booking;
  }

  async cancelBooking(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    const index = this.db.bookings.findIndex(
      (b: Booking) => b.id === booking.id,
    );

    this.db.bookings[index] = booking;
    writeDb(this.db);
    return booking;
  }

  async findById(id: string) {
    const b = this.db.bookings.find((x: any) => x.id === id);
    if (!b) return null;
    return b;
  }
}

export default new BookingRepository();
