import request from "supertest";
import { describe, expect, it } from "vitest";
import InMemoryBookingRepository from "../src/adapters/out/persistence/InMemoryBookingRepository";
import InMemoryScreeningRepository from "../src/adapters/out/persistence/InMemoryScreeningRepository";
import FakePaymentGateway from "../src/adapters/out/payment/FakePaymentGateway";
import { buildApp } from "../src/container";

// Test de l'adapter HTTP : on branche l'app complète sur des adapters de test
const bookingRepository = new InMemoryBookingRepository();
const app = buildApp({
  screenings: new InMemoryScreeningRepository(
    [
      {
        id: "s1",
        movie: "Dune",
        room: "1",
        startsAt: new Date("2030-01-01T20:00:00Z"),
        capacity: 10,
        price: 1000,
      },
    ],
    bookingRepository,
  ),
  bookings: bookingRepository,
  payment: new FakePaymentGateway(() => true),
  notifier: {
    sendNotification: async () => {},
    bookingConfirmed: async () => {},
    bookingCancelled: async () => {},
  },
  clock: { now: () => new Date("2029-12-31T10:00:00Z") },
});

describe("API HTTP", () => {
  it("parcours complet : lister, réserver, consulter, annuler", async () => {
    const list = await request(app).get("/screenings").expect(200);
    expect(list.body[0].remaining).toBe(10);

    const created = await request(app)
      .post("/screenings/s1/bookings")
      .send({ email: "a@b.fr", seats: 2 })
      .expect(201);
    expect(created.body.total).toBe(2000);

    const mine = await request(app).get("/bookings?email=a@b.fr").expect(200);
    expect(mine.body[0].movie).toBe("Dune");

    await request(app).delete(`/bookings/${created.body.id}`).expect(200);
    expect((await request(app).get("/screenings")).body[0].remaining).toBe(10);
  });

  it("traduit les erreurs du domaine en codes HTTP", async () => {
    await request(app)
      .post("/screenings/zz/bookings")
      .send({ email: "a@b.fr", seats: 1 })
      .expect(404);
    await request(app)
      .post("/screenings/s1/bookings")
      .send({ email: "a@b.fr", seats: 9 })
      .expect(400);
    await request(app).delete("/bookings/zz").expect(404);
  });
});
