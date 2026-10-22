import { Booking } from "../../../domain/Booking";

export default interface CancelBooking {
    cancelBooking(bookingId: string): Promise<Booking>;
}
