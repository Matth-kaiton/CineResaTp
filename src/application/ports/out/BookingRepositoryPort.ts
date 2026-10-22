import { Booking } from "../../../domain/types/Booking";

export interface BookingRepositoryPort {
  getAllByMail(email: string): Promise<Booking[]>;
  getById(id: string): Promise<Booking>;
  create(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
}
