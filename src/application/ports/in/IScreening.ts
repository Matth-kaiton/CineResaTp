import { Screening } from "../../../domain/Screening";

export interface IScreening {
  getScreenings(): Promise<Screening[]>;
  getScreeningById(id: string): Promise<Screening>;
}
