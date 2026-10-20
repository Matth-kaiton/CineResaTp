import { Screening } from "../../../domain/Screening";

export interface ScreeningRepositoryPort {
  getScreenings(): Promise<Screening[]>;
  getById(id: string): Promise<Screening>;
  countRemainingSeats(screening: Screening): Promise<number>;
}
