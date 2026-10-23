import { Booking } from "../../../domain/booking/Booking";

export default interface ListMyBookings {
  listMyBookings(email: string | null): Promise<Booking[]>;
}
