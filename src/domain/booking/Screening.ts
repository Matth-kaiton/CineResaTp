import { BookingStatus } from "../enum/BookingStatus";
import { UserStatus } from "../enum/UserStatuts";
import ErrorResponse from "../errorResponse";
import type { DomainEvent } from "../shared/DomainEvent";
import Email from "../shared/Email";
import Money from "../shared/Money";
import Booking, { BookingSnapshot } from "./Booking";
import PricingPolicy from "./PricingPolicy";
import SeatCounts from "./SeatCount";
import { BookingCancelled, BookingConfirmed } from "./events";

export type ScreeningSchedule = {
  id: string;
  movie: string;
  room: string;
  startsAt: Date;
  capacity: number;
  unitPrice: Money;
};

export type ScreeningSnapshot = {
  id: string;
  movie: string;
  room: string;
  startsAt: string;
  capacity: number;
  priceCents: number;
  bookings: BookingSnapshot[];
};

export default class Screening {
  private readonly bookings: Booking[];
  private readonly events: DomainEvent[] = [];

  private constructor(
    readonly id: string,
    readonly movie: string,
    readonly room: string,
    readonly startsAt: Date,
    readonly capacity: number,
    readonly price: Money,
    bookings: Booking[] = [],
  ) {
    this.bookings = bookings;
  }

  static schedule(details: ScreeningSchedule): Screening {
    if (!Number.isInteger(details.capacity) || details.capacity < 1) {
      throw new ErrorResponse("La capacité doit être un entier positif", 400);
    }
    if (Number.isNaN(details.startsAt.getTime())) {
      throw new ErrorResponse("La date de la séance est invalide", 400);
    }
    return new Screening(
      details.id,
      details.movie,
      details.room,
      new Date(details.startsAt),
      details.capacity,
      details.unitPrice,
    );
  }

  static fromSnapshot(snapshot: ScreeningSnapshot): Screening {
    const bookings = snapshot.bookings.map(
      (booking) =>
        new Booking(
          booking.id,
          booking.screeningId,
          new Email(booking.email),
          new SeatCounts(booking.seats),
          booking.tariff,
          new Money(booking.totalCents),
          booking.status,
          new Date(booking.createdAt),
          booking.cancelledAt ? new Date(booking.cancelledAt) : null,
        ),
    );
    if (bookings.some((booking) => booking.screeningId !== snapshot.id)) {
      throw new ErrorResponse("Booking belongs to another screening", 400);
    }
    const screening = Screening.schedule({
      id: snapshot.id,
      movie: snapshot.movie,
      room: snapshot.room,
      startsAt: new Date(snapshot.startsAt),
      capacity: snapshot.capacity,
      unitPrice: new Money(snapshot.priceCents),
    });
    screening.bookings.push(...bookings);
    if (screening.remainingSeats() < 0) {
      throw new ErrorResponse("Snapshot exceeds screening capacity", 400);
    }
    return screening;
  }

  toSnapshot(): ScreeningSnapshot {
    return {
      id: this.id,
      movie: this.movie,
      room: this.room,
      startsAt: this.startsAt.toISOString(),
      capacity: this.capacity,
      priceCents: this.price.cents,
      bookings: this.bookings.map((booking) => booking.toSnapshot()),
    };
  }

  remainingSeats(): number {
    const bookedSeats = this.bookings
      .filter((booking) => booking.getStatus() === BookingStatus.CONFIRMED)
      .reduce((sum, booking) => sum + booking.seats.value, 0);
    return this.capacity - bookedSeats;
  }

  book(request: {
    bookingId: string;
    email: Email;
    seats: SeatCounts;
    tariff: UserStatus | "NORMAL" | "STUDENT";
    now: Date;
  }): Booking {
    if (Number.isNaN(request.now.getTime())) {
      throw new ErrorResponse("La date de réservation est invalide", 400);
    }
    if (this.startsAt.getTime() <= request.now.getTime()) {
      throw new ErrorResponse("La séance a déjà commencé", 409);
    }
    if (this.bookings.some((booking) => booking.id === request.bookingId)) {
      throw new ErrorResponse("Booking already exists", 409);
    }
    if (this.remainingSeats() < request.seats.value) {
      throw new ErrorResponse("Plus assez de places", 409);
    }

    const tariff =
      request.tariff.toUpperCase() === "STUDENT"
        ? UserStatus.STUDENT
        : UserStatus.NORMAL;
    const booking = new Booking(
      request.bookingId,
      this.id,
      request.email,
      request.seats,
      tariff,
      PricingPolicy.calculatePrice(this.price, request.seats, tariff),
      BookingStatus.CONFIRMED,
      new Date(request.now),
    );
    this.bookings.push(booking);
    this.events.push(new BookingConfirmed(booking, request.now));
    return booking;
  }

  cancel(bookingId: string, now: Date): Booking {
    const booking = this.bookings.find((candidate) => candidate.id === bookingId);
    if (!booking) {
      throw new ErrorResponse("Booking not found", 404);
    }
    booking.cancel(now, this.startsAt);
    this.events.push(new BookingCancelled(booking, now));
    return booking;
  }

  pullEvents(): DomainEvent[] {
    return this.events.splice(0);
  }

}

export { Screening };
