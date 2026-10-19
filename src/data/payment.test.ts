import { describe, it, expect } from "vitest";
import { calculatePrice } from "./payment";
import { UserStatus } from "../enum/UserStatuts";

describe("calculatePrice", () => {
  it("should calculate standard price correctly without discounts", () => {
    const price = calculatePrice(10, 2, UserStatus.STANDARD);
    expect(price).toBe(20);
  });

  it("should apply student discount correctly", () => {
    const price = calculatePrice(10, 2, UserStatus.STUDENT);
    // 10 * 2 = 20, 20 * 0.7 = 14
    expect(price).toBe(14);
  });

  it("should apply group discount when seats >= 4", () => {
    const price = calculatePrice(10, 4, UserStatus.STANDARD);
    // 10 * 4 = 40, 40 * 0.9 = 36
    expect(price).toBe(36);
  });

  it("should apply both student and group discounts when applicable", () => {
    const price = calculatePrice(10, 4, UserStatus.STUDENT);
    // 10 * 4 = 40, student: 40 * 0.7 = 28, group: 28 * 0.9 = 25.2, rounded: 25
    expect(price).toBe(25);
  });
});
