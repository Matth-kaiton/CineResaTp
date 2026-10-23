import type Booking from "./Booking";
import type { DomainEvent } from "../shared/DomainEvent";

export class BookingConfirmed implements DomainEvent {
  readonly type = "BookingConfirmed";

  constructor(
    readonly booking: Booking,
    readonly occurredAt: Date,
  ) {}
}

export class BookingCancelled implements DomainEvent {
  readonly type = "BookingCancelled";

  constructor(
    readonly booking: Booking,
    readonly occurredAt: Date,
  ) {}
}
