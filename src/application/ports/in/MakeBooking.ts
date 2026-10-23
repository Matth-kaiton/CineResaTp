import Booking from "../../../domain/booking/Booking";
import SeatCounts from "../../../domain/booking/SeatCount";
import { UserStatus } from "../../../domain/enum/UserStatuts";
import Email from "../../../domain/shared/Email";

export default interface MakeBooking {
  makeBooking(
    id: string,
    email: Email | string,
    seats: SeatCounts | number,
    tarif?: UserStatus | "NORMAL" | "STUDENT",
  ): Promise<Booking>;
}
