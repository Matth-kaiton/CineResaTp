import { Screening } from "../../../domain/types/Screening";

export default interface ListUpcomingScreenings {
  listUpcomingScreenings(): Promise<Screening[]>;
}
