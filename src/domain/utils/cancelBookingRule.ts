import { BookingStatus } from "../enum/BookingStatus";
import ErrorResponse from "../errorResponse";
import { Booking } from "../types/Booking";

export function cancelBookingRule(booking: Booking) {
  if (booking.status === BookingStatus.CANCELLED) {
    throw new ErrorResponse("Booking is already cancelled", 409);
  }
  if (new Date(booking.createdAt).getTime() + 120 * 60 * 1000 < Date.now()) {
    throw new ErrorResponse(
      "Booking can only be cancelled within 2 hours of screening start time",
      409
    );
  }
}
