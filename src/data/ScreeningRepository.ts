import { readDb, writeDb } from "./dbService";

const db = readDb();

class ScreeningRepository {
  async fectAllScreening() {
    const now = new Date();
    const result = [];

    for (const s of db.screenings) {
      if (new Date(s.startsAt) < now) continue;
      let taken = 0;

      for (const b of db.bookings) {
        if (b.screeningId === s.id && b.status === "CONFIRMED")
          taken += b.seats;
      }

      result.push({
        id: s.id,
        movie: s.movie,
        room: s.room,
        startsAt: s.startsAt,
        price: s.price,
        remaining: s.capacity - taken,
      });
    }
  }
}

export default new ScreeningRepository();
