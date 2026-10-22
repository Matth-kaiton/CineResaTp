import { Screening } from "../../../domain/types/Screening";

export interface GetScreeningById {
  getScreeningById(id: string): Promise<Screening | null>;
}
