import { Booking } from "../../../domain/Booking";

export default interface ListMyBookings {
  listMyBookings(email: string): Promise<Booking[]>;
}
