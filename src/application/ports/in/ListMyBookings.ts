import { Booking } from "../../../domain/types/Booking";

export default interface ListMyBookings {
  listMyBookings(email: string | null): Promise<Booking[]>;
}
