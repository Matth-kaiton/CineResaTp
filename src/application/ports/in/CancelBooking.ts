import { Booking } from "../../../domain/booking/Booking";

export default interface CancelBooking {
  cancelBooking(bookingId: string): Promise<Booking>;
}
