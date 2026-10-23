import { Screening } from "../../../domain/booking/Screening";

export interface GetScreeningById {
  getScreeningById(id: string): Promise<Screening | null>;
}
