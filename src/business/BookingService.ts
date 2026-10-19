import { Booking } from "../types/Booking";
import BookingRepository from "../data/BookingRepositiry";
import ScreeningRepository from "../data/ScreeningRepository";
import ScreeningService from "./ScreeningService";
import ErrorResponse from "../types/errorResponse";
import { UserStatus } from "../enum/UserStatuts";
import { BookingStatus } from "../enum/BookingStatus";
import { pay, calculatePrice } from "../data/payment";
import sendMail from "../data/mailer";

class BookingService {
  private bookingRepo = BookingRepository;
  private screeningService = ScreeningService;
  private screeningRepo = ScreeningRepository;

  async makeBooking(
    screeningId: string,
    email: string,
    seats: number,
    tarif: UserStatus = UserStatus.NORMAL,
  ): Promise<Booking> {
    const screening = await this.screeningService.getScreeningById(screeningId);
    if (!screening) {
      throw new ErrorResponse("Screening not found or pass", 404);
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
    const paid = pay(totalPrice);

    if (!paid) {
      throw new ErrorResponse("Payment failed", 402);
    }
    sendMail(
      email,
      `Your booking for ${screening.movie} is confirmed. Total price: ${totalPrice}`,
    );

    const booking: Booking = {
      id: "b" + Date.now(),
      screeningId: screening.id,
      email: email,
      seats: seats,
      tariff: tarif,
      total: totalPrice,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
    };

    return await this.bookingRepo.createBooking(booking);
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const booking: Booking | null = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("Booking is already cancelled");
    }
    if (new Date(booking.createdAt).getTime() + 120 * 60 * 1000 < Date.now()) {
      throw new Error(
        "Booking can only be cancelled within 2 hours of screening start time",
      );
    }

    await this.bookingRepo.cancelBooking(booking);
    return booking;
  }

  async myBookings(email: string | null): Promise<Booking[]> {
    if (!email) {
      throw new ErrorResponse("email not send", 400);
    }

    return this.bookingRepo.fectBookingForUser(email);
  }
}

export default new BookingService();
