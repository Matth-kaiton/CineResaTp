import { Screening } from "../../../domain/Screening";

export default interface ListUpcomingScreenings {
  listUpcomingScreenings(): Promise<Screening[]>;
}
