import { Screening } from "../../../domain/booking/Screening";

export interface ScreeningRepository {
  listUpcomingScreenings(): Promise<Screening[]>;
  getById(id: string): Promise<Screening | null>;
}
