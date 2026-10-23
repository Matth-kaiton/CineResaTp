import Booking from "../../../domain/booking/Booking";

export interface BookingRepository {
  findByEmail(email: string): Promise<Booking[]>;
  findById(id: string): Promise<Booking | null>;
  findByScreeningId(screeningId: string): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  countConfirmedSeats(screeningId: string): Promise<number>;
}
