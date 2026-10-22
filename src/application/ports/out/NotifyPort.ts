import { Booking } from "../../../domain/types/Booking";

export interface NotifyPort {
  sendNotification(to: string, message: string): Promise<void>;
  bookingConfirmed(booking: Booking): Promise<void>;
  bookingCancelled(booking: Booking): Promise<void>;
}
