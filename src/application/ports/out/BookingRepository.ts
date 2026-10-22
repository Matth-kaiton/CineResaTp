import { Booking } from "../../../domain/types/Booking";

export interface BookingRepository {
  findByEmail(email: string): Promise<Booking[]>;
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  countConfirmedSeats(screeningId: string): Promise<number>;
}
