import { Screening } from "../../../domain/Screening";

export interface GetScreeningById {
  getScreeningById(id: string): Promise<Screening | null>;
}
