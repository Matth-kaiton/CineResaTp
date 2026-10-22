import { readDb, writeDb } from "../system/dbService";
import { Booking } from "../../../domain/types/Booking";
import { BookingRepository } from "../../../application/ports/out/BookingRepository";
import {
  UserStatus,
  isValidUserStatus,
} from "../../../domain/enum/UserStatuts";
import {
  BookingStatus,
  isValidBookingStatus,
} from "../../../domain/enum/BookingStatus";
import ErrorResponse from "../../../domain/errorResponse";
import { JsonFile } from "./JsonFile";

export default class JsonBookingRepository implements BookingRepository {
  private readonly db = readDb();
  constructor(file: JsonFile) {}

  async findByEmail(mail: string) {
    const result = await this.db.bookings
      .filter((b: Booking) => b.email === mail)
      .map((b: any) => this.toDomain(b));
    return result;
  }

  async save(booking: Booking) {
    await this.db.bookings.push(this.toRaw(booking));
    writeDb(this.db);
    return booking;
  }

  async update(booking: Booking) {
    const index = await this.db.bookings.findIndex(
      (b: Booking) => b.id === booking.id,
    );

    this.db.bookings[index] = this.toRaw(booking);
    writeDb(this.db);
    return booking;
  }

  async findById(id: string): Promise<Booking> {
    const b = await this.db.bookings.find((x: any) => x.id === id);
    if (!b) throw new ErrorResponse("Booking not found", 404);
    return this.toDomain(b);
  }

  async countConfirmedSeats(screeningId: string): Promise<number> {
    const confirmedBookings = await this.db.bookings.filter(
      (b: any) =>
        b.screeningId === screeningId && b.status === BookingStatus.CONFIRMED,
    );
    const totalSeats = confirmedBookings.reduce(
      (sum: number, b: any) => sum + b.seats,
      0,
    );
    return totalSeats;
  }

  private toDomain(raw: any): Booking {
    if (!isValidUserStatus(raw.tariff)) {
      throw new ErrorResponse(`Invalid UserStatus: ${raw.tariff}`, 400);
    }
    if (!isValidBookingStatus(raw.status)) {
      throw new ErrorResponse(`Invalid BookingStatus: ${raw.status}`, 400);
    }
    const booking: Booking = {
      ...raw,
      tariff: raw.tariff as UserStatus,
      status: raw.status as BookingStatus,
      createdAt: new Date(raw.createdAt),
      cancelledAt: raw.cancelledAt ? new Date(raw.cancelledAt) : undefined,
    };
    return booking;
  }

  private toRaw(booking: Booking): any {
    return {
      ...booking,
      tariff: booking.tariff as string,
      status: booking.status as string,
      createdAt: booking.createdAt.toISOString(),
      cancelledAt: booking.cancelledAt
        ? booking.cancelledAt.toISOString()
        : undefined,
    };
  }
}
