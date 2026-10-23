import Booking from "../../../domain/booking/Booking";
import { BookingRepository } from "../../../application/ports/out/BookingRepository";
import { UserStatus } from "../../../domain/enum/UserStatuts";
import { BookingStatus } from "../../../domain/enum/BookingStatus";
import { JsonFile, BookingRecord } from "./JsonFile";
import Email from "../../../domain/shared/Email";
import SeatCounts from "../../../domain/booking/SeatCount";
import Money from "../../../domain/shared/Money";

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

  async findByScreeningId(screeningId: string): Promise<Booking[]> {
    const data = this.file.read();
    return data.bookings
      .filter((booking) => booking.screeningId === screeningId)
      .map((booking) => this.toDomain(booking));
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
    const domainBooking = new Booking(
      record.id,
      record.screeningId,
      new Email(record.email),
      new SeatCounts(record.seats),
      record.tariff === "STUDENT" ? UserStatus.STUDENT : UserStatus.NORMAL,
      new Money(record.total),
      record.status === "CANCELLED"
        ? BookingStatus.CANCELLED
        : BookingStatus.CONFIRMED,
      new Date(record.createdAt),
    );

    if (record.cancelledAt) {
      domainBooking.setCancelledAt(new Date(record.cancelledAt));
    }
    return domainBooking;
  }

  private toRecord(booking: Booking): BookingRecord {
    const record: BookingRecord = {
      id: booking.id,
      screeningId: booking.screeningId,
      email: booking.email.value,
      seats: booking.seats.value,
      tariff: booking.tariff === UserStatus.STUDENT ? "STUDENT" : "NORMAL",
      total: booking.total.cents,
      status:
        booking.getStatus() === BookingStatus.CANCELLED
          ? "CANCELLED"
          : "CONFIRMED",
      createdAt: booking.createdAt.toISOString(),
    };

    record.cancelledAt = booking.getCancelledAt()?.toString() ?? "";

    return record;
  }
}
