import ErrorResponse from "../../domain/errorResponse";
import { Screening } from "../../domain/Screening";
import { IScreening } from "../ports/in/IScreening";
import { ScreeningRepositoryPort } from "../ports/out/ScreeningRepositoryPort";

export class ScreeningService implements IScreening {
  constructor(private screeningRepo: ScreeningRepositoryPort) {}

  async getScreenings(): Promise<Screening[]> {
    return this.screeningRepo.getScreenings();
  }

  async getScreeningById(id: string): Promise<Screening | null> {
    const screening = await this.screeningRepo.getById(id);
    if (screening) {
      return screening;
    }
    return null;
  }

  // async createScreening(
  //   movie: string,
  //   room: string,
  //   startsAt: string,
  //   price: number,
  //   capacity: number,
  // ) {
  //   const screening: Screening = {
  //     id: "s" + Date.now(),
  //     movie,
  //     room,
  //     startsAt: new Date(startsAt),
  //     price,
  //     capacity,
  //   };
  //   await this.ScreeningRepo.createScreening(screening);
  // }

  // async deleteScreening(id: string) {
  //   await this.ScreeningRepo.deleteScreening(id);
  // }
}
