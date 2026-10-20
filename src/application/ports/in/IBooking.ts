import { Booking } from "../../../domain/Booking";
import { UserStatus } from "../../../domain/enum/UserStatuts";

export default interface IBooking {
  makeBooking(
    id: string,
    email: string,
    seats: number,
    tarif: UserStatus,
  ): Promise<Booking>;
  myBookings(email: string): Promise<Booking[]>;
  cancelBooking(bookingId: string): Promise<Booking>;
}
