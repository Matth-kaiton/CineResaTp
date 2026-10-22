import { Booking } from "../../domain/types/Booking";
import ErrorResponse from "../../domain/errorResponse";
import { UserStatus } from "../../domain/enum/UserStatuts";
import { BookingStatus } from "../../domain/enum/BookingStatus";
import MakeBooking from "../ports/in/MakeBooking";
import { BookingRepository } from "../ports/out/BookingRepository";
import { ScreeningRepository } from "../ports/out/ScreeningRepository";
import { ScreeningService } from "./ScreeningService";
import { NotifyPort } from "../ports/out/NotifyPort";
import { PaymentPort } from "../ports/out/PaymentPort";
import { calculatePrice } from "../../domain/utils/price";
import CancelBooking from "../ports/in/CancelBooking";
import ListMyBookings from "../ports/in/ListMyBookings";
import { cancelBookingRule } from "../../domain/utils/cancelBookingRule";
import { Screening } from "../../domain/types/Screening";

export class BookingService
  implements MakeBooking, CancelBooking, ListMyBookings
{
  constructor(
    private readonly screeningService: ScreeningService,
    private readonly screeningRepo: ScreeningRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly mailer: NotifyPort,
    private readonly payment: PaymentPort,
    private readonly clock: { now: () => Date } = { now: () => new Date() },
  ) {}

  async makeBooking(
    screeningId: string,
    email: string,
    seats: number,
    tarif: UserStatus = UserStatus.NORMAL,
  ): Promise<Booking> {
    const screening = await this.screeningService.getScreeningById(screeningId);
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }
    const now = this.clock.now();

    await this.validateScreening(screening, seats, email, now);

    const totalPrice = calculatePrice(screening.price, seats, tarif);
    const paid = await this.payment.pay(totalPrice);

    if (!paid) {
      throw new ErrorResponse("Payment failed", 402);
    }

    const booking: Booking = await this.bookingRepo.save({
      id: "b" + Date.now(),
      screeningId: screening.id,
      email: email,
      seats: seats,
      tariff: tarif,
      total: totalPrice,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
    });

    await this.mailer.bookingConfirmed(booking);

    return booking;
  }

  private async validateScreening(
    screening: Screening,
    seats: number,
    email: string,
    now: Date,
  ) {
    if (!seats || seats < 1 || seats > 6) {
      throw new ErrorResponse("Seats must be between 1 and 6", 400);
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new ErrorResponse("email not present or wrong format", 400);
    }

    if (new Date(screening.startsAt) <= now) {
      throw new ErrorResponse("Screening has already started", 409);
    }

    const remainingSeats =
      await this.screeningRepo.countRemainingSeats(screening);
    if (remainingSeats < seats) {
      throw new ErrorResponse("Not enough seats available", 409);
    }
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new ErrorResponse("Booking not found", 404);
    }
    const screening = await this.screeningService.getScreeningById(
      booking.screeningId,
    );
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }

    const now = this.clock.now();
    cancelBookingRule(booking, screening.startsAt, now);

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = now;

    const saved = await this.bookingRepo.save(booking);

    await this.mailer.bookingCancelled(saved);

    return saved;
  }

  async listMyBookings(email: string | null): Promise<Booking[]> {
    if (!email) {
      throw new ErrorResponse("email not send", 400);
    }

    return await this.bookingRepo.findByEmail(email);
  }
}
