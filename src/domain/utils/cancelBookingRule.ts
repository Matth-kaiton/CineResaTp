import { BookingStatus } from "../enum/BookingStatus";
import { Booking } from "../types/Booking";

export function cancelBookingRule(booking: Booking) {
  if (booking.status === BookingStatus.CANCELLED) {
    throw new Error("Booking is already cancelled");
  }
  if (new Date(booking.createdAt).getTime() + 120 * 60 * 1000 < Date.now()) {
    throw new Error(
      "Booking can only be cancelled within 2 hours of screening start time",
    );
  }
}
