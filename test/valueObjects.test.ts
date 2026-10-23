import { describe, expect, it } from "vitest";
import SeatCount from "../src/domain/booking/SeatCount";
import Email from "../src/domain/shared/Email";
import Money from "../src/domain/shared/Money";

describe("Value objects", () => {
  it("Money : égalité par valeur et immuabilité", () => {
    const a = Money.euros(10);
    expect(a.equals(Money.cents(1000))).toBe(true);
    expect(a.discount(0.3).cents).toBe(700);
    expect(a.cents).toBe(1000); // a n'a pas changé
    expect(() => Money.cents(-1)).toThrow();
  });

  it("Email : normalisé et validé à la construction", () => {
    expect(new Email("  Alice@Example.COM ").value).toBe("alice@example.com");
    expect(() => new Email("pas-un-mail")).toThrow("Email invalide");
  });

  it("SeatCount : impossible de construire une valeur invalide", () => {
    expect(() => new SeatCount(0)).toThrow();
    expect(() => new SeatCount(7)).toThrow();
    expect(new SeatCount(4).isGroup()).toBe(true);
  });
});
