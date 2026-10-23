import { BookingStatus } from "../enum/BookingStatus";
import { UserStatus } from "../enum/UserStatuts";
import ErrorResponse from "../errorResponse";
import Email from "../shared/Email";
import Money from "../shared/Money";
import SeatCounts from "./SeatCount";

export type BookingSnapshot = {
  id: string;
  screeningId: string;
  email: string;
  seats: number;
  tariff: UserStatus;
  totalCents: number;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
};

export default class Booking {
  readonly CANCEL_TIME_LIMIT: number = 120 * 60 * 1000;
  private currentStatus: BookingStatus;
  private cancellationDate: Date | null;

  constructor(
    readonly id: string,
    readonly screeningId: string,
    readonly email: Email,
    readonly seats: SeatCounts,
    readonly tariff: UserStatus,
    readonly total: Money,
    status: BookingStatus,
    readonly createdAt: Date,
    cancelledAt: Date | null = null,
  ) {
    this.currentStatus = status;
    this.cancellationDate = cancelledAt;
  }

  cancel(now: Date, screeningStartAt: Date): Booking {
    this.cancelBookingRule(this, screeningStartAt, now);

    this.currentStatus = BookingStatus.CANCELLED;
    this.cancellationDate = now;

    return this;
  }

  cancelBookingRule(booking: Booking, screeningStartTime: Date, now: Date) {
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ErrorResponse("Booking is already cancelled", 409);
    }
    if (
      new Date(screeningStartTime).getTime() - now.getTime() <
      this.CANCEL_TIME_LIMIT
    ) {
      throw new ErrorResponse(
        "La réservation ne peut pas être annulée moins de 2h avant la séance",
        409,
      );
    }
  }

  getCancelledAt() {
    return this.cancellationDate;
  }

  setCancelledAt(date: Date) {
    this.cancellationDate = date;
  }

  getStatus() {
    return this.currentStatus;
  }

  get status(): BookingStatus {
    return this.currentStatus;
  }

  get cancelledAt(): Date | null {
    return this.cancellationDate;
  }

  toSnapshot(): BookingSnapshot {
    return {
      id: this.id,
      screeningId: this.screeningId,
      email: this.email.value,
      seats: this.seats.value,
      tariff: this.tariff,
      totalCents: this.total.cents,
      status: this.currentStatus,
      createdAt: this.createdAt.toISOString(),
      cancelledAt: this.cancellationDate?.toISOString() ?? null,
    };
  }
}

export { Booking };
