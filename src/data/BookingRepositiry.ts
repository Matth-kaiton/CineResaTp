import { readDb, writeDb } from "./dbService";
import { UserStatus } from "../enum/UserStatuts";
import { BookingStatus } from "../enum/BookingStatus";
import { Booking } from "../types/Booking";

const db = readDb();

function fectBookingForUser(mail: string) {
  const list = db.bookings.filter((b: any) => b.email === mail);
}

function createBooking(
  screeningId: string,
  email: string,
  seats: number,
  tarif: UserStatus = UserStatus.NORMAL,
  total: number,
) {
  const booking = {
    id: "b" + Date.now(),
    screeningId: screeningId,
    email: email,
    seats: seats,
    tariff: tarif,
    total: total,
    status: BookingStatus.CONFIRMED,
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  writeDb(db);
}

function deleteBooking(booking: Booking) {
  booking.status = BookingStatus.CANCELLED;
  writeDb(db);
}

function findById(id: string) {
  const b = db.bookings.find((x: any) => x.id === id);
  if (!b) return null;
  return b;
}
