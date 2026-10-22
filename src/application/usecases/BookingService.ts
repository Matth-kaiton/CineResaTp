import { Booking } from "../../domain/types/Booking";
import ErrorResponse from "../../domain/errorResponse";
import { UserStatus } from "../../domain/enum/UserStatuts";
import { BookingStatus } from "../../domain/enum/BookingStatus";
import MakeBooking from "../ports/in/MakeBooking";
import { BookingRepositoryPort } from "../ports/out/BookingRepositoryPort";
import { ScreeningRepositoryPort } from "../ports/out/ScreeningRepositoryPort";
import { ScreeningService } from "./ScreeningService";
import { NotifyPort } from "../ports/out/NotifyPort";
import { PaymentPort } from "../ports/out/PaymentPort";
import { calculatePrice } from "../../domain/utils/price";
import CancelBooking from "../ports/in/CancelBooking";
import ListMyBookings from "../ports/in/ListMyBookings";
import { cancelBookingRule } from "../../domain/utils/cancelBookingRule";

export class BookingService
  implements MakeBooking, CancelBooking, ListMyBookings
{
  constructor(
    private screeningService: ScreeningService,
    private screeningRepo: ScreeningRepositoryPort,
    private bookingRepo: BookingRepositoryPort,
    private mailer: NotifyPort,
    private payment: PaymentPort,
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
    if (!seats || seats < 1 || seats > 6) {
      throw new ErrorResponse("Seats must be between 1 and 6", 400);
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new ErrorResponse("email not present or wrong format", 400);
    }

    if (new Date(screening.startsAt) <= new Date()) {
      throw new ErrorResponse("Screening has already started", 409);
    }

    const remainingSeats =
      await this.screeningRepo.countRemainingSeats(screening);
    if (remainingSeats < seats) {
      throw new ErrorResponse("Not enough seats available", 409);
    }

    const totalPrice = calculatePrice(screening.price, seats, tarif);
    const paid = await this.payment.pay(totalPrice);

    if (!paid) {
      throw new ErrorResponse("Payment failed", 402);
    }

    const booking: Booking = await this.bookingRepo.create({
      id: "b" + Date.now(),
      screeningId: screening.id,
      email: email,
      seats: seats,
      tariff: tarif,
      total: totalPrice,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
    });

    await this.mailer.sendNotification(
      email,
      `Your booking for ${screening.movie} is confirmed. Total price: ${totalPrice}`,
    );

    return booking;
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.getById(bookingId);
    if (!booking) {
      throw new ErrorResponse("Booking not found", 404);
    }
    const screening = await this.screeningService.getScreeningById(
      booking.screeningId,
    );
    if (!screening) {
      throw new ErrorResponse("Screening not found", 404);
    }
    cancelBookingRule(booking, screening.startsAt);

    return await this.bookingRepo.update(booking);
  }

  async listMyBookings(email: string | null): Promise<Booking[]> {
    if (!email) {
      throw new ErrorResponse("email not send", 400);
    }

    return await this.bookingRepo.getAllByMail(email);
  }
}
