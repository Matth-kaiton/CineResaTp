import { Booking } from "../types/Booking";
import BookingRepository from "../data/BookingRepositiry";
import ScreeningRepository from "../data/ScreeningRepository";
import ScreeningService from "./ScreeningService";
import ErrorResponse from "../types/errorResponse";
import { UserStatus } from "../enum/UserStatuts";
import { BookingStatus } from "../enum/BookingStatus";

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

    const unitPrice = screening.price;
    let totalPrice = unitPrice * seats;
    if (tarif === UserStatus.STUDENT) {
      totalPrice = Math.round(totalPrice * 0.7);
    }
    if (seats >= 4) {
      totalPrice = Math.round(totalPrice * 0.9);
    }
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
