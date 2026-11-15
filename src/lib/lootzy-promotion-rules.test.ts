import { describe, expect, it } from "vitest";
import { PROMOTION_START, PROMOTION_END, PROMOTION_OFFERS, promotionActive } from "./lootzy-promotion-rules";

describe("Mining purchase promotion", () => {
  it("offers exactly two Pink cases for 100,000 UZS", () => {
    expect(PROMOTION_OFFERS.find(o => o.amount === 100000)).toEqual({ amount: 100000, pink: 2, green: 0 });
  });
  it("offers one Pink and two Green cases for 50,000 UZS", () => {
    expect(PROMOTION_OFFERS.find(o => o.amount === 50000)).toEqual({ amount: 50000, pink: 1, green: 2 });
  });
  it("has a single 15-hour window, not a per-visitor timer", () => {
    expect(Date.parse(PROMOTION_END) - Date.parse(PROMOTION_START)).toBe(15 * 3600000);
    expect(promotionActive(Date.parse(PROMOTION_START))).toBe(true);
    expect(promotionActive(Date.parse(PROMOTION_END) - 1)).toBe(true);
    expect(promotionActive(Date.parse(PROMOTION_START) - 1)).toBe(false);
    expect(promotionActive(Date.parse(PROMOTION_END))).toBe(false);
    expect(promotionActive(Date.parse(PROMOTION_END) + 86400000)).toBe(false);
  });
});