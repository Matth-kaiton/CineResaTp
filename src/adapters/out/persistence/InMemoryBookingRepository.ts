import { BookingRepository } from "../../../application/ports/out/BookingRepository";
import { BookingStatus } from "../../../domain/enum/BookingStatus";
import { Booking } from "../../../domain/types/Booking";

export default class InMemoryBookingRepository implements BookingRepository {
  private bookings: Booking[] = [];

  async findByEmail(email: string): Promise<Booking[]> {
    return this.bookings.filter((b) => b.email === email);
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = this.bookings.find((b) => b.id === id);
    return booking || null;
  }

  async save(booking: Booking): Promise<Booking> {
    const index = this.bookings.findIndex((b) => b.id === booking.id);
    if (index !== -1) {
      this.bookings[index] = booking;
    } else {
      this.bookings.push(booking);
    }
    return booking;
  }

  async update(booking: Booking): Promise<Booking> {
    return this.save(booking);
  }

  async countConfirmedSeats(screeningId: string): Promise<number> {
    const confirmedBookings = this.bookings.filter(
      (b) =>
        b.screeningId === screeningId && b.status === BookingStatus.CONFIRMED,
    );
    return confirmedBookings.reduce((sum, b) => sum + b.seats, 0);
  }
}
