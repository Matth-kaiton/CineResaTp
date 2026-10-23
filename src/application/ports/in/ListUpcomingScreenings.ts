import { Screening } from "../../../domain/booking/Screening";

export default interface ListUpcomingScreenings {
  listUpcomingScreenings(): Promise<Screening[]>;
}
