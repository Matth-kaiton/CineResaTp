import { describe, expect, it } from "vitest";
import { BookingConfirmed } from "../src/domain/booking/events";
import { Screening } from "../src/domain/booking/Screening";
import SeatCount from "../src/domain/booking/SeatCount";
import Email from "../src/domain/shared/Email";
import Money from "../src/domain/shared/Money";

// Tests de l'agrégat : 100 % domaine, aucun port, aucun adapter
const NOW = new Date("2026-10-20T10:00:00Z");
const screening = () =>
  Screening.schedule({
    id: "s1",
    movie: "Dune",
    room: "1",
    startsAt: new Date("2026-10-20T20:00:00Z"),
    capacity: 10,
    unitPrice: Money.euros(10),
  });
const req = (
  id: string,
  seats: number,
  tariff: "NORMAL" | "STUDENT" = "NORMAL",
) => ({
  bookingId: id,
  email: new Email("a@b.fr"),
  seats: new SeatCount(seats),
  tariff,
  now: NOW,
});

describe("Screening (racine d'agrégat)", () => {
  it("réserve, calcule le prix et émet BookingConfirmed", () => {
    const s = screening();
    const b = s.book(req("b1", 4, "STUDENT"));
    expect(b.total.cents).toBe(2520);
    expect(s.remainingSeats()).toBe(6);
    const events = s.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(BookingConfirmed);
    expect(s.pullEvents()).toHaveLength(0);
  });

  it("protège l'invariant de capacité", () => {
    const s = screening();
    s.book(req("b1", 6));
    expect(() => s.book(req("b2", 5))).toThrow("Plus assez de places");
    expect(s.remainingSeats()).toBe(4);
  });

  it("libère les places à l'annulation et émet BookingCancelled", () => {
    const s = screening();
    s.book(req("b1", 6));
    s.pullEvents();
    s.cancel("b1", NOW);
    expect(s.remainingSeats()).toBe(10);
    expect(s.pullEvents()[0].type).toBe("BookingCancelled");
  });

  it("refuse l'annulation à moins de 2h", () => {
    const s = screening();
    s.book(req("b1", 1));
    expect(() => s.cancel("b1", new Date("2026-10-20T18:30:00Z"))).toThrow(
      "moins de 2h",
    );
  });

  it("snapshot aller-retour sans perte", () => {
    const s = screening();
    s.book(req("b1", 2));
    expect(Screening.fromSnapshot(s.toSnapshot()).toSnapshot()).toEqual(
      s.toSnapshot(),
    );
  });
});
