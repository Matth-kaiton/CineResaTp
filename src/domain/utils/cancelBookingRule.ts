import { Booking } from "../types/Booking";

export function cancelBookingRule(booking: Booking): boolean {
  return new Date(booking.createdAt).getTime() + 120 * 60 * 1000 > Date.now();
}
