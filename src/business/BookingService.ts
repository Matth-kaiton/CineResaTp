import { Booking } from "../types/Booking";
import BookingRepository from "../data/BookingRepositiry";
import ScreeningRepository from "../data/ScreeningRepository";
import ScreeningService from "./ScreeningService";
import { UserStatus } from "../enum/UserStatuts";

class BookingService {
  private bookingRepo = BookingRepository;
  private screeningService = ScreeningService;
  private screeningRepo = ScreeningRepository;

  async makeBooking(
    screeningId: string,
    email: string,
    seats: number,
    tarif: UserStatus,
  ): Promise<void> {
    const screening = await this.screeningService.getScreeningById(screeningId);
    if (!screening) {
      throw new Error("Screening not found");
    }

    if (seats < 1 || seats > 6) {
      throw new Error("Seats must be between 1 and 6");
    }

    if (new Date(screening.startsAt) <= new Date()) {
      throw new Error("Screening has already started");
    }

    const remainingSeats =
      await this.screeningRepo.countRemainingSeats(screening);
    if (remainingSeats < seats) {
      throw new Error("Not enough seats available");
    }

    const unitPrice = screening.price;
    let totalPrice = unitPrice * seats;
    if (tarif === UserStatus.STUDENT) {
      totalPrice = Math.round(totalPrice * 0.7);
    }
    if (seats >= 4) {
      totalPrice = Math.round(totalPrice * 0.9);
    }

    await this.bookingRepo.createBooking(
      screeningId,
      email,
      seats,
      tarif,
      totalPrice,
    );
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const booking: Booking | null = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    await this.bookingRepo.deleteBooking(booking);
  }

  async myBookings(email: string): Promise<Booking[]> {
    return this.bookingRepo.fectBookingForUser(email);
  }
}

export default new BookingService();
