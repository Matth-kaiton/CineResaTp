import { Booking } from "../../../domain/types/Booking";

export default interface CancelBooking {
    cancelBooking(bookingId: string): Promise<Booking>;
}
