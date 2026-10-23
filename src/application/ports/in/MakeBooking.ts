import Booking from "../../../domain/booking/Booking";
import SeatCounts from "../../../domain/booking/SeatCount";
import { UserStatus } from "../../../domain/enum/UserStatuts";
import Email from "../../../domain/shared/Email";

export default interface MakeBooking {
  makeBooking(
    id: string,
    email: Email,
    seats: SeatCounts,
    tarif: UserStatus,
  ): Promise<Booking>;
}
