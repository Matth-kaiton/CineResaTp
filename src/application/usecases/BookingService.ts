import Booking from "../../domain/booking/Booking";
import ErrorResponse from "../../domain/errorResponse";
import { UserStatus } from "../../domain/enum/UserStatuts";
import MakeBooking from "../ports/in/MakeBooking";
import { BookingRepository } from "../ports/out/BookingRepository";
import { ScreeningService } from "./ScreeningService";
import { NotifyPort } from "../ports/out/NotifyPort";
import { PaymentPort } from "../ports/out/PaymentPort";
import CancelBooking from "../ports/in/CancelBooking";
import ListMyBookings from "../ports/in/ListMyBookings";
import Email from "../../domain/shared/Email";
import SeatCounts from "../../domain/booking/SeatCount";

export class BookingService
  implements MakeBooking, CancelBooking, ListMyBookings
{
  constructor(
    private readonly screeningService: ScreeningService,
    private readonly bookingRepo: BookingRepository,
    private readonly mailer: NotifyPort,
    private readonly payment: PaymentPort,
    private readonly clock: { now: () => Date } = { now: () => new Date() },
  ) {}

  async makeBooking(
    screeningId: string,
    email: Email | string,
    seats: SeatCounts | number,
    tarif: UserStatus | "NORMAL" | "STUDENT" = UserStatus.NORMAL,
  ): Promise<Booking> {
    const screening = await this.screeningService.getScreeningById(screeningId);
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }
    const now = this.clock.now();
    const booking = screening.book({
      bookingId: "b" + Date.now(),
      email: typeof email === "string" ? new Email(email) : email,
      seats: typeof seats === "number" ? new SeatCounts(seats) : seats,
      tariff:
        tarif.toUpperCase() === "STUDENT"
          ? UserStatus.STUDENT
          : UserStatus.NORMAL,
      now,
    });
    const paid = await this.payment.pay(booking.total);

    if (!paid) {
      throw new ErrorResponse("Payment failed", 402);
    }

    await this.bookingRepo.save(booking);

    await this.mailer.bookingConfirmed(booking);

    return booking;
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const existingBooking = await this.bookingRepo.findById(bookingId);
    if (!existingBooking) {
      throw new ErrorResponse("Booking not found", 404);
    }
    const screening = await this.screeningService.getScreeningById(
      existingBooking.screeningId,
    );
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }
    const now = this.clock.now();
    const booking = screening.cancel(bookingId, now);

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
