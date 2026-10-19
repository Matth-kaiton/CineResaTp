import { Screening } from "../types/Screening";
import ScreeningRepository from "../data/ScreeningRepository";

class ScreeningService {
  private ScreeningRepo = ScreeningRepository;

  async getScreenings(): Promise<Screening[]> {
    return this.ScreeningRepo.fectAllScreening();
  }

  async getScreeningById(id: string): Promise<Screening | undefined> {
    return this.getScreenings().then((screenings) =>
      screenings.find((s: Screening) => s.id === id),
    );
  }

  async createScreening(
    movie: string,
    room: string,
    startsAt: string,
    price: number,
    capacity: number,
  ) {
    const screening: Screening = {
      id: "s" + Date.now(),
      movie,
      room,
      startsAt: new Date(startsAt),
      price,
      capacity,
    };
    await this.ScreeningRepo.createScreening(screening);
  }

  async deleteScreening(id: string) {
    await this.ScreeningRepo.deleteScreening(id);
  }
}

export default new ScreeningService();
