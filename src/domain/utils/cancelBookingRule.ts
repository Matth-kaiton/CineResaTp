import { BookingStatus } from "../enum/BookingStatus";
import ErrorResponse from "../errorResponse";
import Booking from "../booking/Booking";

export function cancelBookingRule(
  booking: Booking,
  screeningStartTime: Date,
  now: Date = new Date(),
) {
  if (booking.getStatus() === BookingStatus.CANCELLED) {
    throw new ErrorResponse("Booking is already cancelled", 409);
  }
  if (
    new Date(screeningStartTime).getTime() - now.getTime() <
    120 * 60 * 1000
  ) {
    throw new ErrorResponse(
      "Booking can only be cancelled at least 2 hours before screening start time",
      409,
    );
  }
}
