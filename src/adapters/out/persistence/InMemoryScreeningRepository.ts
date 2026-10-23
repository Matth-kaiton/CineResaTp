import { ScreeningRepository } from "../../../application/ports/out/ScreeningRepository";
import Screening, { ScreeningSchedule } from "../../../domain/booking/Screening";
import { BookingRepository } from "../../../application/ports/out/BookingRepository";
import Money from "../../../domain/shared/Money";

export default class InMemoryScreeningRepository implements ScreeningRepository {
  private readonly screenings: Screening[];

  constructor(
    screenings: Array<
      Screening | (Omit<ScreeningSchedule, "unitPrice"> & { price: number })
    >,
    private bookingRepository: BookingRepository,
  ) {
    this.screenings = screenings.map((screening) =>
      screening instanceof Screening
        ? screening
        : Screening.schedule({
            ...screening,
            unitPrice: new Money(screening.price),
          }),
    );
  }

  async listUpcomingScreenings(): Promise<Screening[]> {
    return Promise.all(this.screenings.map((screening) => this.hydrate(screening)));
  }

  async getById(id: string): Promise<Screening | null> {
    const screening = this.screenings.find((s) => s.id === id);
    return screening ? this.hydrate(screening) : null;
  }

  private async hydrate(screening: Screening): Promise<Screening> {
    const bookings = await this.bookingRepository.findByScreeningId(
      screening.id,
    );
    return Screening.fromSnapshot({
      ...screening.toSnapshot(),
      bookings: bookings.map((booking) => booking.toSnapshot()),
    });
  }
}
