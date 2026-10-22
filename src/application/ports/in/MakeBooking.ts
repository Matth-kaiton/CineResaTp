import { Booking } from "../../../domain/Booking";
import { UserStatus } from "../../../domain/enum/UserStatuts";

export default interface MakeBooking {
  makeBooking(
    id: string,
    email: string,
    seats: number,
    tarif: UserStatus,
  ): Promise<Booking>;
}
