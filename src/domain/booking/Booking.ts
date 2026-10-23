import { BookingStatus } from "../enum/BookingStatus";
import { UserStatus } from "../enum/UserStatuts";
import ErrorResponse from "../errorResponse";
import Email from "../shared/Email";
import Money from "../shared/Money";
import SeatCounts from "./SeatCount";

export default class Booking {
  readonly CANCEL_TIME_LIMIT: number = 120 * 60 * 1000;

  constructor(
    readonly id: string,
    readonly screeningId: string,
    readonly email: Email,
    readonly seats: SeatCounts,
    readonly tariff: UserStatus,
    readonly total: Money,
    private status: BookingStatus,
    readonly createdAt: Date,
    private cancelledAt: Date | null = null,
  ) {}

  cancel(now: Date, screeningStartAt: Date): Booking {
    this.cancelBookingRule(this, screeningStartAt, now);

    this.status = BookingStatus.CANCELLED;
    this.cancelledAt = now;

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
        "Booking can only be cancelled at least 2 hours before screening start time",
        409,
      );
    }
  }

  getCancelledAt() {
    return this.cancelledAt;
  }

  setCancelledAt(date: Date) {
    this.cancelledAt = date;
  }

  getStatus() {
    return this.status;
  }
}
