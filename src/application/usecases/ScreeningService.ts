import { Screening } from "../../domain/types/Screening";
import { GetScreeningById } from "../ports/in/GetScreeningById";
import ListUpcomingScreenings from "../ports/in/ListUpcomingScreenings";
import { ScreeningRepository } from "../ports/out/ScreeningRepository";

export class ScreeningService
  implements GetScreeningById, ListUpcomingScreenings
{
  constructor(private readonly screeningRepo: ScreeningRepository) {}

  async listUpcomingScreenings(): Promise<Screening[]> {
    return this.screeningRepo.listUpcomingScreenings();
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
