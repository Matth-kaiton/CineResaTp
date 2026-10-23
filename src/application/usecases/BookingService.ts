import Booking from "../../domain/booking/Booking";
import ErrorResponse from "../../domain/errorResponse";
import { UserStatus } from "../../domain/enum/UserStatuts";
import { BookingStatus } from "../../domain/enum/BookingStatus";
import MakeBooking from "../ports/in/MakeBooking";
import { BookingRepository } from "../ports/out/BookingRepository";
import { ScreeningRepository } from "../ports/out/ScreeningRepository";
import { ScreeningService } from "./ScreeningService";
import { NotifyPort } from "../ports/out/NotifyPort";
import { PaymentPort } from "../ports/out/PaymentPort";
import { calculatePrice } from "../../domain/booking/price";
import CancelBooking from "../ports/in/CancelBooking";
import ListMyBookings from "../ports/in/ListMyBookings";
import { Screening } from "../../domain/booking/Screening";
import Email from "../../domain/shared/Email";
import SeatCounts from "../../domain/booking/SeatCount";
import PricingPolicy from "../../domain/booking/PricingPolicy";

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
    email: Email,
    seats: SeatCounts,
    tarif: UserStatus = UserStatus.NORMAL,
  ): Promise<Booking> {
    const screening = await this.screeningService.getScreeningById(screeningId);
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }
    const now = this.clock.now();

    await this.validateScreening(screening, seats, now);

    const totalPrice = PricingPolicy.calculatePrice(
      screening.price,
      seats,
      tarif,
    );
    const paid = await this.payment.pay(totalPrice);

    if (!paid) {
      throw new ErrorResponse("Payment failed", 402);
    }

    const booking = new Booking(
      "b" + Date.now(),
      screening.id,
      email,
      seats,
      tarif,
      totalPrice,
      BookingStatus.CONFIRMED,
      now,
    );

    await this.bookingRepo.save(booking);

    await this.mailer.bookingConfirmed(booking);

    return booking;
  }

  private async validateScreening(
    screening: Screening,
    seats: SeatCounts,
    now: Date,
  ) {
    if (new Date(screening.startsAt) <= now) {
      throw new ErrorResponse("Screening has already started", 409);
    }

    const remainingSeats =
      await this.screeningRepo.countRemainingSeats(screening);
    if (remainingSeats < seats.value) {
      throw new ErrorResponse("Not enough seats available", 409);
    }
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    let booking = await this.bookingRepo.findById(bookingId);
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

    booking = booking.cancel(now, screening.startsAt);

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
