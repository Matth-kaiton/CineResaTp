import { BookingStatus } from "../enum/BookingStatus";
import { UserStatus } from "../enum/UserStatuts";

export type Booking = {
  id: string;
  screeningId: string;
  email: string;
  seats: number;
  tariff: UserStatus;
  total: number;
  status: BookingStatus;
  createdAt: Date;
};
