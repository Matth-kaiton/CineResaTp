import { Screening } from "../../../domain/types/Screening";

export interface ScreeningRepositoryPort {
  listUpcomingScreenings(): Promise<Screening[]>;
  getById(id: string): Promise<Screening | null>;
  countRemainingSeats(screening: Screening): Promise<number>;
}
