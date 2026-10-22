import { Booking } from "../../../domain/types/Booking";
import { BookingRepository } from "../../../application/ports/out/BookingRepository";
import { UserStatus } from "../../../domain/enum/UserStatuts";
import { BookingStatus } from "../../../domain/enum/BookingStatus";
import { JsonFile, BookingRecord } from "./JsonFile";

export default class JsonBookingRepository implements BookingRepository {
  constructor(private readonly file: JsonFile) {}

  async findByEmail(email: string): Promise<Booking[]> {
    const data = this.file.read();
    return data.bookings
      .filter((b) => b.email === email)
      .map((b) => this.toDomain(b));
  }

  async findById(id: string): Promise<Booking | null> {
    const data = this.file.read();
    const record = data.bookings.find((b) => b.id === id);
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(booking: Booking): Promise<Booking> {
    const data = this.file.read();
    const record = this.toRecord(booking);
    const index = data.bookings.findIndex((b) => b.id === booking.id);
    if (index !== -1) {
      data.bookings[index] = record;
    } else {
      data.bookings.push(record);
    }
    this.file.write(data);
    return booking;
  }

  async update(booking: Booking): Promise<Booking> {
    return this.save(booking);
  }

  async countConfirmedSeats(screeningId: string): Promise<number> {
    const data = this.file.read();
    return data.bookings
      .filter((b) => b.screeningId === screeningId && b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.seats, 0);
  }

  private toDomain(record: BookingRecord): Booking {
    const domainBooking: Booking = {
      id: record.id,
      screeningId: record.screeningId,
      email: record.email,
      seats: record.seats,
      tariff:
        record.tariff === "STUDENT" ? UserStatus.STUDENT : UserStatus.NORMAL,
      total: record.total,
      status:
        record.status === "CANCELLED"
          ? BookingStatus.CANCELLED
          : BookingStatus.CONFIRMED,
      createdAt: new Date(record.createdAt),
    };
    if (record.cancelledAt) {
      domainBooking.cancelledAt = new Date(record.cancelledAt);
    }
    return domainBooking;
  }

  private toRecord(booking: Booking): BookingRecord {
    const record: BookingRecord = {
      id: booking.id,
      screeningId: booking.screeningId,
      email: booking.email,
      seats: booking.seats,
      tariff: booking.tariff === UserStatus.STUDENT ? "STUDENT" : "NORMAL",
      total: booking.total,
      status:
        booking.status === BookingStatus.CANCELLED ? "CANCELLED" : "CONFIRMED",
      createdAt: booking.createdAt.toISOString(),
    };
    if (booking.cancelledAt) {
      record.cancelledAt = booking.cancelledAt.toISOString();
    }
    return record;
  }
}
