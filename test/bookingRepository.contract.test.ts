import fs from "fs";
import os from "os";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import InMemoryBookingRepository from "../src/adapters/out/persistence/InMemoryBookingRepository";
import JsonBookingRepository from "../src/adapters/out/persistence/JsonBookingRepository";
import { JsonFile } from "../src/adapters/out/persistence/JsonFile";
import { BookingRepository } from "../src/application/ports/out/BookingRepository";
import { Booking } from "../src/domain/types/Booking";
import { UserStatus } from "../src/domain/enum/UserStatuts";
import { BookingStatus } from "../src/domain/enum/BookingStatus";

// Test de contrat : LA MÊME suite s'exécute sur chaque adapter du port.
// Si un nouvel adapter (SQLite, Postgres…) passe cette suite, il est substituable (Liskov).
const booking = (over: Partial<Booking> = {}): Booking => ({
  id: "b1", screeningId: "s1", email: "a@b.fr", seats: 2, tariff: UserStatus.NORMAL, total: 2000,
  status: BookingStatus.CONFIRMED, createdAt: new Date("2026-10-20T10:00:00Z"), ...over,
});

function contract(name: string, factory: () => BookingRepository) {
  describe(`BookingRepository — ${name}`, () => {
    let repo: BookingRepository;
    beforeEach(() => {
      repo = factory();
    });

    it("save puis findById restitue la réservation (dates comprises)", async () => {
      await repo.save(booking());
      expect(await repo.findById("b1")).toEqual(booking());
    });

    it("findById inconnu -> null", async () => {
      expect(await repo.findById("nope")).toBeNull();
    });

    it("save sur un id existant met à jour", async () => {
      await repo.save(booking());
      await repo.save(booking({ status: BookingStatus.CANCELLED, cancelledAt: new Date("2026-10-20T11:00:00Z") }));
      expect((await repo.findById("b1"))?.status).toBe(BookingStatus.CANCELLED);
      expect(await repo.findByEmail("a@b.fr")).toHaveLength(1);
    });

    it("countConfirmedSeats ignore les annulées et les autres séances", async () => {
      await repo.save(booking({ id: "b1", seats: 2 }));
      await repo.save(booking({ id: "b2", seats: 3 }));
      await repo.save(booking({ id: "b3", seats: 4, status: BookingStatus.CANCELLED }));
      await repo.save(booking({ id: "b4", seats: 5, screeningId: "s2" }));
      expect(await repo.countConfirmedSeats("s1")).toBe(5);
    });
  });
}

contract("in-memory", () => new InMemoryBookingRepository());
contract("fichier JSON", () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cineresa-")), "db.json");
  fs.writeFileSync(file, JSON.stringify({ screenings: [], bookings: [] }));
  return new JsonBookingRepository(new JsonFile(file));
});
